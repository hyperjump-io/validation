import jsonStringify from "json-stable-stringify";
import { TextEncoder } from "text-encoding";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";


export const nil = JsonReference.nil;
export const value = JsonReference.value;
export const pointer = JsonReference.pointer;
export const get = JsonReference.get;
export const map = JsonReference.map;
export const entries = JsonReference.entries;

export const validate = async (doc) => {
  const metaValidator = await metaValidate(doc, {});
  const result = metaValidator(value(doc));

  if (!ValidationResult.isValid(result)) {
    throw result;
  }

  return _validate(doc, {});
};

const v = (validatorFactory) => {
  return async (doc, memo) => {
    if (!memo[doc.url]) {
      memo[doc.url] = (_value) => false;

      const validatorList = await entries(doc)
        .filter(([keyword, _]) => keyword in validators)
        .map(async ([keyword, keywordDoc]) => {
          const ptr = pointer(keywordDoc);
          const validator = await validatorFactory(keyword)(keywordDoc, memo);

          return (value) => [ptr, validator(value)];
        });

      memo[doc.url] = (value) => validatorList.map((validator) => validator(value));
    }

    return (value) => memo[doc.url](value);
  };
};

const _validate = v((keyword) => validators[keyword]);

const metaValidate = v((keyword) => {
  return async (doc, memo) => {
    const metaDoc = await get(`http://validation.hyperjump.com/common/${keyword}`);
    const validator = await _validate(metaDoc, memo);

    return (value) => {
      const result = validator(value[keyword]);
      return ValidationResult.isValid(result);
    };
  };
});

const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;

const isType = {
  "null": (value) => value === null,
  "boolean": (value) => typeof value === "boolean",
  "object": isObject,
  "array": (value) => Array.isArray(value),
  "number": (value) => typeof value === "number",
  "string": (value) => typeof value === "string"
};

const numberEqual = (a, b) => {
  return Math.abs(a - b) < Number.EPSILON;
};

const multipleOf = (multipleOf, value) => {
  const remainder = value % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

const jsonStringLength = (string) => (new TextEncoder("utf-8").encode(string)).length;

const validators = {
  "const": async (doc) => {
    const constValue = value(doc);
    const expected = jsonStringify(constValue);
    return (value) => jsonStringify(value) === expected;
  },
  "type": async (doc) => isType[value(doc)],
  "multipleOf": async (doc) => {
    const multipleOfValue = value(doc);
    return (value) => typeof value !== "number" || multipleOf(multipleOfValue, value);
  },
  "maximum": async (doc) => {
    const maximum = value(doc);
    return (value) => typeof value !== "number" || value <= maximum;
  },
  "exclusiveMaximum": async (doc) => {
    const exclusiveMaximum = value(doc);
    return (value) => typeof value !== "number" || value < exclusiveMaximum;
  },
  "minimum": async (doc) => {
    const minimum = value(doc);
    return (value) => typeof value !== "number" || value >= minimum;
  },
  "exclusiveMinimum": async (doc) => {
    const exclusiveMinimum = value(doc);
    return (value) => typeof value !== "number" || value > exclusiveMinimum;
  },
  "maxLength": async (doc) => {
    const maxLength = value(doc);
    return (value) => typeof value !== "string" || jsonStringLength(value) <= maxLength;
  },
  "minLength": async (doc) => {
    const minLength = value(doc);
    return (value) => typeof value !== "string" || jsonStringLength(value) >= minLength;
  },
  "pattern": async (doc) => {
    const pattern = new RegExp(value(doc));
    return (value) => typeof value !== "string" || pattern.test(value);
  },
  "items": async (doc, memo) => {
    const validateItem = await _validate(doc, memo);
    return (value) => !Array.isArray(value) || value.every((item) => {
      return ValidationResult.isValid(validateItem(item));
    });
  },
  "tupleItems": async (doc, memo) => {
    const tupleItems = await map((itemSchema) => _validate(itemSchema, memo), doc);
    return (value) => !Array.isArray(value) || value.every((item, ndx) => {
      return !(ndx in tupleItems) || ValidationResult.isValid(tupleItems[ndx](item));
    });
  },
  "maxItems": async (doc) => {
    const maxItems = value(doc);
    return (value) => !Array.isArray(value) || value.length <= maxItems;
  },
  "minItems": async (doc) => {
    const minItems = value(doc);
    return (value) => !Array.isArray(value) || value.length >= minItems;
  },
  "uniqueItems": async (doc) => {
    const uniqueItems = value(doc);
    return (value) => {
      if (!Array.isArray(value) || uniqueItems === false) {
        return true;
      }

      const normalizedItems = value.map(jsonStringify);
      return (new Set(normalizedItems)).size === normalizedItems.length;
    };
  },
  "properties": async (doc, memo) => {
    const propertyValidators = new Map(await entries(doc)
      .map(async ([propertyName, propertySchema]) => {
        return [propertyName, await _validate(propertySchema, memo)];
      }));

    return (value) => !isObject(value) || Object.keys(value)
      .filter((propertyName) => propertyValidators.has(propertyName))
      .every((propertyName) => {
        const validator = propertyValidators.get(propertyName);
        const result = validator(value[propertyName]);
        return ValidationResult.isValid(result);
      });
  },
  "patternProperties": async (doc, memo) => {
    const validators = await entries(doc)
      .map(async ([propertyPattern, propertySchema]) => {
        return [new RegExp(propertyPattern), await _validate(propertySchema, memo)];
      });

    return (value) => !isObject(value) || validators
      .every(([pattern, validateProperty]) => Object.keys(value)
        .filter((propertyName) => pattern.test(propertyName))
        .every((propertyName) => ValidationResult.isValid(validateProperty(value[propertyName]))));
  },
  "propertyNames": async (doc, memo) => {
    const validateName = await _validate(doc, memo);
    return (value) => !isObject(value) || Object.keys(value)
      .every((name) => ValidationResult.isValid(validateName(name)));
  },
  "maxProperties": async (doc) => {
    const maxProperties = value(doc);
    return (value) => !isObject(value) || Object.keys(value).length <= maxProperties;
  },
  "minProperties": async (doc) => {
    const minProperties = value(doc);
    return (value) => !isObject(value) || Object.keys(value).length >= minProperties;
  },
  "required": async (doc) => {
    const required = value(doc);
    return (value) => !isObject(value) || required.every((propertyName) => propertyName in value);
  },
  "allOf": async (doc, memo) => {
    const allOf = await map((subSchema) => _validate(subSchema, memo), doc);
    return (value) => allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)));
  },
  "anyOf": async (doc, memo) => {
    const anyOf = await map((subSchema) => _validate(subSchema, memo), doc);
    return (value) => anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)));
  },
  "oneOf": async (doc, memo) => {
    const oneOf = await map((subSchema) => _validate(subSchema, memo), doc);
    return (value) => oneOf.reduce((acc, validateSchema) => {
      const isValid = ValidationResult.isValid(validateSchema(value));
      return acc ? !isValid : isValid;
    }, false);
  },
  "not": async (doc, memo) => {
    const validateSchema = await _validate(doc, memo);
    return (doc) => !ValidationResult.isValid(validateSchema(doc));
  }
};
