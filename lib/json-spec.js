import jsonStringify from "json-stable-stringify";
import * as JsonPointer from "@hyperjump/json-pointer";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";


export const load = JsonReference.load;
export const value = JsonReference.value;
export const pointer = JsonReference.pointer;
export const follow = JsonReference.follow;

const _validate = (schema, memo) => {
  if (!memo[schema.url]) {
    memo[schema.url] = (_value) => false;

    const validatorList = Object.keys(value(schema))
      .filter((keyword) => validators[keyword])
      .map((keyword) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(keyword));
        return validators[keyword](follow(schema, url), memo);
      });

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
  "items": (schema, memo) => {
    const ptr = pointer(schema);
    const validateItem = _validate(schema, memo);
    return (value) => [
      ptr,
      !Array.isArray(value) || value.every((item) => ValidationResult.isValid(validateItem(item)))
    ];
  },
  "tupleItems": (schema, memo) => {
    const ptr = pointer(schema);
    const tupleItems = value(schema)
      .map((_, ndx) => follow(schema, JsonPointer.append(schema.url, ndx)))
      .map((itemSchema) => _validate(itemSchema, memo));

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
  "properties": (schema, memo) => {
    const ptr = pointer(schema);
    const propertySchemas = value(schema);
    const propertyValidators = Object.keys(propertySchemas)
      .reduce((propertyValidators, propertyName) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(propertyName));
        const propertySchema = follow(schema, url);
        propertyValidators[propertyName] = _validate(propertySchema, memo);
        return propertyValidators;
      }, {});

    return (value) => [
      ptr,
      !isObject(value) || Object.keys(value)
        .filter((propertyName) => propertyValidators[propertyName])
        .every((propertyName) => ValidationResult.isValid(propertyValidators[propertyName](value[propertyName])))
    ];
  },
  "patternProperties": (schema, memo) => {
    const ptr = pointer(schema);
    const patternProperties = value(schema);
    const validators = Object.keys(patternProperties)
      .map((propertyPattern) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(propertyPattern));
        const propertySchema = follow(schema, url);
        return [new RegExp(propertyPattern), _validate(propertySchema, memo)];
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
  "propertyNames": (schema, memo) => {
    const ptr = pointer(schema);
    const validateName = _validate(schema, memo);
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
  "allOf": (schema, memo) => {
    const ptr = pointer(schema);
    const allOf = value(schema)
      .map((_, ndx) => follow(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => _validate(subSchema, memo));

    return (value) => [ptr, allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "anyOf": (schema, memo) => {
    const ptr = pointer(schema);
    const anyOf = value(schema)
      .map((_, ndx) => follow(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => _validate(subSchema, memo));

    return (value) => [ptr, anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "oneOf": (schema, memo) => {
    const ptr = pointer(schema);
    const oneOf = value(schema)
      .map((_, ndx) => follow(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => _validate(subSchema, memo));

    return (value) => [
      ptr,
      oneOf.reduce((acc, validateSchema) => {
        const isValid = ValidationResult.isValid(validateSchema(value));
        return acc ? !isValid : isValid;
      }, false)
    ];
  },
  "not": (schema, memo) => {
    const ptr = pointer(schema);
    const validateSchema = _validate(schema, memo);
    return (schema) => [ptr, !ValidationResult.isValid(validateSchema(schema))];
  }
};

export const validate = (schema) => _validate(schema, {});
