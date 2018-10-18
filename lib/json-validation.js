import jsonStringify from "json-stable-stringify";
import { TextEncoder } from "text-encoding";
import * as JsonPointer from "@hyperjump/json-pointer";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";


export const nil = JsonReference.nil;
export const value = JsonReference.value;
export const pointer = JsonReference.pointer;
export const get = JsonReference.get;
export const map = JsonReference.map;
export const entries = JsonReference.entries;

export const validate = async (doc) => {
  const metaValidator = await _metaValidate(doc, {});
  const result = metaValidator(value(doc));

  if (!ValidationResult.isValid(result)) {
    throw result;
  }

  return await _validate(doc, {});
};

const _validate = async (doc, memo) => {
  if (!memo[doc.url]) {
    memo[doc.url] = (_value) => false;

    const $meta = await get("#/$meta", doc);
    const meta = value($meta) || {};

    const validatorList = await entries(doc)
      .filter(([keyword, _]) => keyword !== "$meta")
      .map(async ([keyword, keywordDoc]) => {
        const ptr = pointer(keywordDoc);

        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${ptr}'`);
        }

        const validator = await validators[meta[keyword]](keywordDoc, memo);

        return (value) => [ptr, validator(value)];
      });

    memo[doc.url] = (value) => validatorList.map((validator) => validator(value));
  }

  return (value) => memo[doc.url](value);
};

const metaValidators = {};
const _metaValidate = async (doc, memo) => {
  const $meta = await get("#/$meta", doc);
  const meta = value($meta) || {};

  await Promise.all(Object.entries(meta)
    .filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaValidators))
    .map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = await get(keywordUrl);
      metaValidators[keywordUrl] = false;
      metaValidators[keywordUrl] = await _validate(metaDoc, memo);
    }));

  return (value) => {
    return Object.keys(value)
      .filter((keyword) => keyword in meta)
      .map((keyword) => {
        const keywordUrl = meta[keyword];
        const result = metaValidators[keywordUrl](value[keyword]);
        return [JsonPointer.cons(keyword, JsonPointer.nil), ValidationResult.isValid(result)];
      });
  };
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

const numberEqual = (a, b) => {
  return Math.abs(a - b) < Number.EPSILON;
};

const multipleOf = (multipleOf, value) => {
  const remainder = value % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

const jsonStringLength = (string) => (new TextEncoder("utf-8").encode(string)).length;

const validators = {};

validators["http://validation.hyperjump.io/common/const"] = async (doc) => {
  const constValue = value(doc);
  const expected = jsonStringify(constValue);
  return (value) => jsonStringify(value) === expected;
};

validators["http://validation.hyperjump.io/common/type"] = async (doc) => isType[value(doc)];

validators["http://validation.hyperjump.io/common/multipleOf"] = async (doc) => {
  const multipleOfValue = value(doc);
  return (value) => typeof value !== "number" || multipleOf(multipleOfValue, value);
};

validators["http://validation.hyperjump.io/common/maximum"] = async (doc) => {
  const maximum = value(doc);
  return (value) => typeof value !== "number" || value <= maximum;
};

validators["http://validation.hyperjump.io/common/exclusiveMaximum"] = async (doc) => {
  const exclusiveMaximum = value(doc);
  return (value) => typeof value !== "number" || value < exclusiveMaximum;
};

validators["http://validation.hyperjump.io/common/minimum"] = async (doc) => {
  const minimum = value(doc);
  return (value) => typeof value !== "number" || value >= minimum;
};

validators["http://validation.hyperjump.io/common/exclusiveMinimum"] = async (doc) => {
  const exclusiveMinimum = value(doc);
  return (value) => typeof value !== "number" || value > exclusiveMinimum;
};

validators["http://validation.hyperjump.io/common/maxLength"] = async (doc) => {
  const maxLength = value(doc);
  return (value) => typeof value !== "string" || jsonStringLength(value) <= maxLength;
};

validators["http://validation.hyperjump.io/common/minLength"] = async (doc) => {
  const minLength = value(doc);
  return (value) => typeof value !== "string" || jsonStringLength(value) >= minLength;
};

validators["http://validation.hyperjump.io/common/pattern"] = async (doc) => {
  const pattern = new RegExp(value(doc));
  return (value) => typeof value !== "string" || pattern.test(value);
};

validators["http://validation.hyperjump.io/common/items"] = async (doc, memo) => {
  const validateItem = await _validate(doc, memo);
  return (value) => !Array.isArray(value) || value.every((item) => {
    return ValidationResult.isValid(validateItem(item));
  });
};

validators["http://validation.hyperjump.io/common/tupleItems"] = async (doc, memo) => {
  const tupleItems = await map((itemSchema) => _validate(itemSchema, memo), doc);
  return (value) => !Array.isArray(value) || value.every((item, ndx) => {
    return !(ndx in tupleItems) || ValidationResult.isValid(tupleItems[ndx](item));
  });
};

validators["http://validation.hyperjump.io/common/maxItems"] = async (doc) => {
  const maxItems = value(doc);
  return (value) => !Array.isArray(value) || value.length <= maxItems;
};

validators["http://validation.hyperjump.io/common/minItems"] = async (doc) => {
  const minItems = value(doc);
  return (value) => !Array.isArray(value) || value.length >= minItems;
};

validators["http://validation.hyperjump.io/common/uniqueItems"] = async (doc) => {
  const uniqueItems = value(doc);
  return (value) => {
    if (!Array.isArray(value) || uniqueItems === false) {
      return true;
    }

    const normalizedItems = value.map(jsonStringify);
    return (new Set(normalizedItems)).size === normalizedItems.length;
  };
};

validators["http://validation.hyperjump.io/common/properties"] = async (doc, memo) => {
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
};

validators["http://validation.hyperjump.io/common/patternProperties"] = async (doc, memo) => {
  const validators = await entries(doc)
    .map(async ([propertyPattern, propertySchema]) => {
      return [new RegExp(propertyPattern), await _validate(propertySchema, memo)];
    });

  return (value) => !isObject(value) || validators
    .every(([pattern, validateProperty]) => Object.keys(value)
      .filter((propertyName) => pattern.test(propertyName))
      .every((propertyName) => ValidationResult.isValid(validateProperty(value[propertyName]))));
};

validators["http://validation.hyperjump.io/common/propertyNames"] = async (doc, memo) => {
  const validateName = await _validate(doc, memo);
  return (value) => !isObject(value) || Object.keys(value)
    .every((name) => ValidationResult.isValid(validateName(name)));
};

validators["http://validation.hyperjump.io/common/maxProperties"] = async (doc) => {
  const maxProperties = value(doc);
  return (value) => !isObject(value) || Object.keys(value).length <= maxProperties;
};

validators["http://validation.hyperjump.io/common/minProperties"] = async (doc) => {
  const minProperties = value(doc);
  return (value) => !isObject(value) || Object.keys(value).length >= minProperties;
};

validators["http://validation.hyperjump.io/common/required"] = async (doc) => {
  const required = value(doc);
  return (value) => !isObject(value) || required.every((propertyName) => propertyName in value);
};

validators["http://validation.hyperjump.io/common/allOf"] = async (doc, memo) => {
  const allOf = await map((subSchema) => _validate(subSchema, memo), doc);
  return (value) => allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)));
};

validators["http://validation.hyperjump.io/common/anyOf"] = async (doc, memo) => {
  const anyOf = await map((subSchema) => _validate(subSchema, memo), doc);
  return (value) => anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)));
};

validators["http://validation.hyperjump.io/common/oneOf"] = async (doc, memo) => {
  const oneOf = await map((subSchema) => _validate(subSchema, memo), doc);
  return (value) => oneOf.reduce((acc, validateSchema) => {
    const isValid = ValidationResult.isValid(validateSchema(value));
    return acc ? !isValid : isValid;
  }, false);
};

validators["http://validation.hyperjump.io/common/not"] = async (doc, memo) => {
  const validateSchema = await _validate(doc, memo);
  return (value) => !ValidationResult.isValid(validateSchema(value));
};

validators["http://validation.hyperjump.io/common/definitions"] = async () => () => true;

validators["http://validation.hyperjump.io/common/validation"] = async (doc, memo) => {
  const validator = await _metaValidate(doc, memo);
  const isSchema = value(doc);

  return (value) => {
    if (!isObject(value) || isSchema === false) {
      return true;
    }

    const result = validator(value);
    return ValidationResult.isValid(result);
  };
};
