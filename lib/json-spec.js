import jsonStringify from "json-stable-stringify";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";


export const nil = JsonReference.nil;
export const value = JsonReference.value;
export const pointer = JsonReference.pointer;
export const get = JsonReference.get;
export const map = JsonReference.map;
export const entries = JsonReference.entries;

const _validate = async (schema, memo) => {
  if (!memo[schema.url]) {
    memo[schema.url] = (_value) => false;

    const validatorList = await entries(schema)
      .filter(([keyword, _]) => keyword in validators)
      .map(([keyword, keywordSchema]) => validators[keyword](keywordSchema, memo));

    memo[schema.url] = (value) => validatorList.map((validator) => validator(value));
  }

  return (value) => memo[schema.url](value);
};

const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;

const isType = {
  "null": (value) => value === null,
  "boolean": (value) => typeof value === "boolean",
  "object": isObject,
  "array": (value) => Array.isArray(value),
  "number": (value) => typeof value === "number",
  "integer": (value) => Number.isInteger(value),
  "string": (value) => typeof value === "string"
};

const validators = {
  "const": (schema) => {
    const ptr = pointer(schema);
    const expectedValue = value(schema);
    return (value) => [ptr, jsonStringify(value) === jsonStringify(expectedValue)];
  },
  "type": (schema) => {
    const ptr = pointer(schema);
    const type = value(schema);
    return (value) => [ptr, isType[type](value)];
  },
  "multipleOf": (schema) => {
    const ptr = pointer(schema);
    const multipleOf = value(schema);

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
  "maximum": (schema) => {
    const ptr = pointer(schema);
    const maximum = value(schema);
    return (value) => [ptr, typeof value !== "number" || value <= maximum];
  },
  "exclusiveMaximum": (schema) => {
    const ptr = pointer(schema);
    const exclusiveMaximum = value(schema);
    return (value) => [ptr, typeof value !== "number" || value < exclusiveMaximum];
  },
  "minimum": (schema) => {
    const ptr = pointer(schema);
    const minimum = value(schema);
    return (value) => [ptr, typeof value !== "number" || value >= minimum];
  },
  "exclusiveMinimum": (schema) => {
    const ptr = pointer(schema);
    const exclusiveMinimum = value(schema);
    return (value) => [ptr, typeof value !== "number" || value > exclusiveMinimum];
  },
  "maxLength": (schema) => {
    // TODO: Handle emojis correctly
    const ptr = pointer(schema);
    const length = value(schema);
    return (value) => [ptr, typeof value !== "string" || value.length <= length];
  },
  "minLength": (schema) => {
    // TODO: Handle emojis correctly
    const ptr = pointer(schema);
    const length = value(schema);
    return (value) => [ptr, typeof value !== "string" || value.length >= length];
  },
  "pattern": (schema) => {
    const ptr = pointer(schema);
    const pattern = new RegExp(value(schema));
    return (value) => [ptr, typeof value !== "string" || pattern.test(value)];
  },
  "format": (schema) => {
    // TODO: implement me
    const ptr = pointer(schema);
    return (_value) => [ptr, true];
  },
  "items": async (schema, memo) => {
    const ptr = pointer(schema);
    const validateItem = await _validate(schema, memo);
    return (value) => [
      ptr,
      !Array.isArray(value) || value.every((item) => ValidationResult.isValid(validateItem(item)))
    ];
  },
  "tupleItems": async (schema, memo) => {
    const ptr = pointer(schema);
    const tupleItems = await map((itemSchema) => _validate(itemSchema, memo), schema);

    return (value) => [
      ptr,
      !Array.isArray(value) || value.every((item, ndx) => ValidationResult.isValid(tupleItems[ndx](item)))
    ];
  },
  "maxItems": (schema) => {
    const ptr = pointer(schema);
    const maxItems = value(schema);
    return (value) => [ptr, !Array.isArray(value) || value.length <= maxItems];
  },
  "minItems": (schema) => {
    const ptr = pointer(schema);
    const minItems = value(schema);
    return (value) => [ptr, !Array.isArray(value) || value.length >= minItems];
  },
  "uniqueItems": (schema) => {
    const ptr = pointer(schema);
    const uniqueItems = value(schema);
    return (value) => {
      if (!Array.isArray(value) || uniqueItems === false) {
        return [ptr, true];
      }

      const normalizedItems = value.map(jsonStringify);
      return [ptr, (new Set(normalizedItems)).size === normalizedItems.length];
    };
  },
  "properties": async (schema, memo) => {
    const ptr = pointer(schema);
    const propertyValidators = new Map(await entries(schema)
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
  "patternProperties": async (schema, memo) => {
    const ptr = pointer(schema);
    const validators = await entries(schema)
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
  "propertyNames": async (schema, memo) => {
    const ptr = pointer(schema);
    const validateName = await _validate(schema, memo);
    return (value) => [
      ptr,
      !isObject(value) || Object.keys(value)
        .every((name) => ValidationResult.isValid(validateName(name)))
    ];
  },
  "maxProperties": (schema) => {
    const ptr = pointer(schema);
    const maxProperties = value(schema);
    return (value) => [ptr, !isObject(value) || Object.keys(value).length <= maxProperties];
  },
  "minProperties": (schema) => {
    const ptr = pointer(schema);
    const minProperties = value(schema);
    return (value) => [ptr, !isObject(value) || Object.keys(value).length >= minProperties];
  },
  "required": (schema) => {
    const ptr = pointer(schema);
    const required = value(schema);
    return (value) => [ptr, !isObject(value) || required.every((propertyName) => propertyName in value)];
  },
  "allOf": async (schema, memo) => {
    const ptr = pointer(schema);
    const allOf = await map((subSchema) => _validate(subSchema, memo), schema);

    return (value) => [ptr, allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "anyOf": async (schema, memo) => {
    const ptr = pointer(schema);
    const anyOf = await map((subSchema) => _validate(subSchema, memo), schema);

    return (value) => [ptr, anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "oneOf": async (schema, memo) => {
    const ptr = pointer(schema);
    const oneOf = await map((subSchema) => _validate(subSchema, memo), schema);

    return (value) => [
      ptr,
      oneOf.reduce((acc, validateSchema) => {
        const isValid = ValidationResult.isValid(validateSchema(value));
        return acc ? !isValid : isValid;
      }, false)
    ];
  },
  "not": async (schema, memo) => {
    const ptr = pointer(schema);
    const validateSchema = await _validate(schema, memo);
    return (schema) => [ptr, !ValidationResult.isValid(validateSchema(schema))];
  }
};

export const validate = (schema) => _validate(schema, {});
