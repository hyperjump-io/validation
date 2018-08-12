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

const _validate = async (doc, memo) => {
  if (!memo[doc.url]) {
    memo[doc.url] = (_value) => false;

    const validatorList = await entries(doc)
      .filter(([keyword, _]) => keyword in validators)
      .map(([keyword, keywordSchema]) => validators[keyword](keywordSchema, memo));

    memo[doc.url] = (value) => validatorList.map((validator) => validator(value));
  }

  return (value) => memo[doc.url](value);
};

const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;

const isType = {
  "null": (value) => value === null,
  "boolean": (value) => typeof value === "boolean",
  "object": isObject,
  "array": (value) => Array.isArray(value),
  "number": (value) => typeof value === "number",
  "string": (value) => typeof value === "string"
};

const validators = {
  "const": (doc) => {
    const ptr = pointer(doc);
    const constValue = value(doc);
    const expected = jsonStringify(constValue);
    return (value) => [ptr, jsonStringify(value) === expected];
  },
  "type": (doc) => {
    const ptr = pointer(doc);
    const type = value(doc);
    return (value) => [ptr, isType[type](value)];
  },
  "multipleOf": (doc) => {
    const ptr = pointer(doc);
    const multipleOf = value(doc);

    return (value) => {
      if (typeof value !== "number") {
        return [ptr, true];
      }

      const remainder = value % multipleOf;
      return [
        ptr,
        remainder === 0 || multipleOf - remainder < Number.EPSILON || remainder < Number.EPSILON
      ];
    };
  },
  "maximum": (doc) => {
    const ptr = pointer(doc);
    const maximum = value(doc);
    return (value) => [ptr, typeof value !== "number" || value <= maximum];
  },
  "exclusiveMaximum": (doc) => {
    const ptr = pointer(doc);
    const exclusiveMaximum = value(doc);
    return (value) => [ptr, typeof value !== "number" || value < exclusiveMaximum];
  },
  "minimum": (doc) => {
    const ptr = pointer(doc);
    const minimum = value(doc);
    return (value) => [ptr, typeof value !== "number" || value >= minimum];
  },
  "exclusiveMinimum": (doc) => {
    const ptr = pointer(doc);
    const exclusiveMinimum = value(doc);
    return (value) => [ptr, typeof value !== "number" || value > exclusiveMinimum];
  },
  "maxLength": (doc) => {
    const ptr = pointer(doc);
    const length = value(doc);
    return (value) => {
      if (typeof value !== "string") {
        return [ptr, true];
      }

      const str = new TextEncoder("utf-8").encode(value);
      return [ptr, str.length <= length];
    };
  },
  "minLength": (doc) => {
    const ptr = pointer(doc);
    const length = value(doc);
    return (value) => {
      if (typeof value !== "string") {
        return [ptr, true];
      }

      const str = new TextEncoder("utf-8").encode(value);
      return [ptr, str.length >= length];
    };
  },
  "pattern": (doc) => {
    const ptr = pointer(doc);
    const pattern = new RegExp(value(doc));
    return (value) => [ptr, typeof value !== "string" || pattern.test(value)];
  },
  "items": async (doc, memo) => {
    const ptr = pointer(doc);
    const validateItem = await _validate(doc, memo);
    return (value) => [
      ptr,
      !Array.isArray(value) || value.every((item) => ValidationResult.isValid(validateItem(item)))
    ];
  },
  "tupleItems": async (doc, memo) => {
    const ptr = pointer(doc);
    const tupleItems = await map((itemSchema) => _validate(itemSchema, memo), doc);

    return (value) => [
      ptr,
      !Array.isArray(value) || value.every((item, ndx) => {
        return !(ndx in tupleItems) || ValidationResult.isValid(tupleItems[ndx](item));
      })
    ];
  },
  "maxItems": (doc) => {
    const ptr = pointer(doc);
    const maxItems = value(doc);
    return (value) => [ptr, !Array.isArray(value) || value.length <= maxItems];
  },
  "minItems": (doc) => {
    const ptr = pointer(doc);
    const minItems = value(doc);
    return (value) => [ptr, !Array.isArray(value) || value.length >= minItems];
  },
  "uniqueItems": (doc) => {
    const ptr = pointer(doc);
    const uniqueItems = value(doc);
    return (value) => {
      if (!Array.isArray(value) || uniqueItems === false) {
        return [ptr, true];
      }

      const normalizedItems = value.map(jsonStringify);
      return [ptr, (new Set(normalizedItems)).size === normalizedItems.length];
    };
  },
  "properties": async (doc, memo) => {
    const ptr = pointer(doc);
    const propertyValidators = new Map(await entries(doc)
      .map(async ([propertyName, propertySchema]) => {
        return [propertyName, await _validate(propertySchema, memo)];
      }));

    return (value) => [
      ptr,
      !isObject(value) || Object.keys(value)
        .filter((propertyName) => propertyValidators.has(propertyName))
        .every((propertyName) => {
          const validator = propertyValidators.get(propertyName);
          const result = validator(value[propertyName]);
          return ValidationResult.isValid(result);
        })
    ];
  },
  "patternProperties": async (doc, memo) => {
    const ptr = pointer(doc);
    const validators = await entries(doc)
      .map(async ([propertyPattern, propertySchema]) => {
        return [new RegExp(propertyPattern), await _validate(propertySchema, memo)];
      });

    return (value) => {
      if (!isObject(value)) {
        return [ptr, true];
      }

      const propertyNames = Object.keys(value);
      return [
        ptr,
        validators
          .every(([pattern, validateProperty]) => propertyNames
            .filter((propertyName) => pattern.test(propertyName))
            .every((propertyName) => ValidationResult.isValid(validateProperty(value[propertyName]))))
      ];
    };
  },
  "propertyNames": async (doc, memo) => {
    const ptr = pointer(doc);
    const validateName = await _validate(doc, memo);
    return (value) => [
      ptr,
      !isObject(value) || Object.keys(value)
        .every((name) => ValidationResult.isValid(validateName(name)))
    ];
  },
  "maxProperties": (doc) => {
    const ptr = pointer(doc);
    const maxProperties = value(doc);
    return (value) => [ptr, !isObject(value) || Object.keys(value).length <= maxProperties];
  },
  "minProperties": (doc) => {
    const ptr = pointer(doc);
    const minProperties = value(doc);
    return (value) => [ptr, !isObject(value) || Object.keys(value).length >= minProperties];
  },
  "required": (doc) => {
    const ptr = pointer(doc);
    const required = value(doc);
    return (value) => [ptr, !isObject(value) || required.every((propertyName) => propertyName in value)];
  },
  "allOf": async (doc, memo) => {
    const ptr = pointer(doc);
    const allOf = await map((subSchema) => _validate(subSchema, memo), doc);

    return (value) => [ptr, allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "anyOf": async (doc, memo) => {
    const ptr = pointer(doc);
    const anyOf = await map((subSchema) => _validate(subSchema, memo), doc);

    return (value) => [ptr, anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "oneOf": async (doc, memo) => {
    const ptr = pointer(doc);
    const oneOf = await map((subSchema) => _validate(subSchema, memo), doc);

    return (value) => [
      ptr,
      oneOf.reduce((acc, validateSchema) => {
        const isValid = ValidationResult.isValid(validateSchema(value));
        return acc ? !isValid : isValid;
      }, false)
    ];
  },
  "not": async (doc, memo) => {
    const ptr = pointer(doc);
    const validateSchema = await _validate(doc, memo);
    return (doc) => [ptr, !ValidationResult.isValid(validateSchema(doc))];
  }
};

export const validate = (doc) => _validate(doc, {});
