import jsonStringify from "json-stable-stringify";
import * as JsonPointer from "@/json-pointer";
import JsonReference from "@/json-reference";
import * as ValidationResult from "@/validation-result";


const JsonSpec = JsonReference;

const validate = (schema, memo) => {
  if (!memo[schema.url]) {
    memo[schema.url] = (_value) => false;

    const validatorList = Object.keys(JsonSpec.value(schema))
      .filter((keyword) => validators[keyword])
      .map((keyword) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(keyword));
        return validators[keyword](JsonSpec.get(schema, url), memo);
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
    const pointer = JsonSpec.pointer(schema);
    const expectedValue = JsonSpec.value(schema);
    return (value) => [pointer, jsonStringify(value) === jsonStringify(expectedValue)];
  },
  "type": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const type = JsonSpec.value(schema);
    return (value) => [pointer, isType[type](value)];
  },
  "multipleOf": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const multipleOf = JsonSpec.value(schema);

    return (value) => {
      if (typeof value !== "number") {
        return [pointer, true];
      }

      const remainder = value % multipleOf;
      return [
        pointer,
        remainder === 0 || multipleOf - remainder < Number.EPSILON || remainder < Number.EPSILON
      ];
    };
  },
  "maximum": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const maximum = JsonSpec.value(schema);
    return (value) => [pointer, typeof value !== "number" || value <= maximum];
  },
  "exclusiveMaximum": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const exclusiveMaximum = JsonSpec.value(schema);
    return (value) => [pointer, typeof value !== "number" || value < exclusiveMaximum];
  },
  "minimum": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const minimum = JsonSpec.value(schema);
    return (value) => [pointer, typeof value !== "number" || value >= minimum];
  },
  "exclusiveMinimum": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const exclusiveMinimum = JsonSpec.value(schema);
    return (value) => [pointer, typeof value !== "number" || value > exclusiveMinimum];
  },
  "maxLength": (schema) => {
    // TODO: Handle emojis correctly
    const pointer = JsonSpec.pointer(schema);
    const length = JsonSpec.value(schema);
    return (value) => [pointer, typeof value !== "string" || value.length <= length];
  },
  "minLength": (schema) => {
    // TODO: Handle emojis correctly
    const pointer = JsonSpec.pointer(schema);
    const length = JsonSpec.value(schema);
    return (value) => [pointer, typeof value !== "string" || value.length >= length];
  },
  "pattern": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const pattern = new RegExp(JsonSpec.value(schema));
    return (value) => [pointer, typeof value !== "string" || pattern.test(value)];
  },
  "format": (schema) => {
    // TODO: implement me
    const pointer = JsonSpec.pointer(schema);
    return (_value) => [pointer, true];
  },
  "items": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const validateItem = validate(schema, memo);
    return (value) => [
      pointer,
      !Array.isArray(value) || value.every((item) => ValidationResult.isValid(validateItem(item)))
    ];
  },
  "tupleItems": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const tupleItems = JsonSpec.value(schema)
      .map((_, ndx) => JsonSpec.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((itemSchema) => validate(itemSchema, memo));

    return (value) => [
      pointer,
      !Array.isArray(value) || value.every((item, ndx) => ValidationResult.isValid(tupleItems[ndx](item)))
    ];
  },
  "maxItems": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const maxItems = JsonSpec.value(schema);
    return (value) => [pointer, !Array.isArray(value) || value.length <= maxItems];
  },
  "minItems": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const minItems = JsonSpec.value(schema);
    return (value) => [pointer, !Array.isArray(value) || value.length >= minItems];
  },
  "uniqueItems": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const uniqueItems = JsonSpec.value(schema);
    return (value) => {
      if (!Array.isArray(value) || uniqueItems === false) {
        return [pointer, true];
      }

      const normalizedItems = value.map(jsonStringify);
      return [pointer, (new Set(normalizedItems)).size === normalizedItems.length];
    };
  },
  "properties": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const propertySchemas = JsonSpec.value(schema);
    const propertyValidators = Object.keys(propertySchemas)
      .reduce((propertyValidators, propertyName) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(propertyName));
        const propertySchema = JsonSpec.get(schema, url);
        propertyValidators[propertyName] = validate(propertySchema, memo);
        return propertyValidators;
      }, {});

    return (value) => [
      pointer,
      !isObject(value) || Object.keys(value)
        .filter((propertyName) => propertyValidators[propertyName])
        .every((propertyName) => ValidationResult.isValid(propertyValidators[propertyName](value[propertyName])))
    ];
  },
  "patternProperties": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const patternProperties = JsonSpec.value(schema);
    const validators = Object.keys(patternProperties)
      .map((propertyPattern) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(propertyPattern));
        const propertySchema = JsonSpec.get(schema, url);
        return [new RegExp(propertyPattern), validate(propertySchema, memo)];
      });

    return (value) => {
      if (!isObject(value)) {
        return [pointer, true];
      }

      const propertyNames = Object.keys(value);
      return [
        pointer,
        validators
          .every(([pattern, validateProperty]) => propertyNames
            .filter((propertyName) => pattern.test(propertyName))
            .every((propertyName) => ValidationResult.isValid(validateProperty(value[propertyName]))))
      ];
    };
  },
  "propertyNames": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const validateName = validate(schema, memo);
    return (value) => [
      pointer,
      !isObject(value) || Object.keys(value)
        .every((name) => ValidationResult.isValid(validateName(name)))
    ];
  },
  "maxProperties": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const maxProperties = JsonSpec.value(schema);
    return (value) => [pointer, !isObject(value) || Object.keys(value).length <= maxProperties];
  },
  "minProperties": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const minProperties = JsonSpec.value(schema);
    return (value) => [pointer, !isObject(value) || Object.keys(value).length >= minProperties];
  },
  "required": (schema) => {
    const pointer = JsonSpec.pointer(schema);
    const required = JsonSpec.value(schema);
    return (value) => [pointer, !isObject(value) || required.every((propertyName) => propertyName in value)];
  },
  "allOf": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const allOf = JsonSpec.value(schema)
      .map((_, ndx) => JsonSpec.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => validate(subSchema, memo));

    return (value) => [pointer, allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "anyOf": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const anyOf = JsonSpec.value(schema)
      .map((_, ndx) => JsonSpec.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => validate(subSchema, memo));

    return (value) => [pointer, anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "oneOf": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const oneOf = JsonSpec.value(schema)
      .map((_, ndx) => JsonSpec.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => validate(subSchema, memo));

    return (value) => [
      pointer,
      oneOf.reduce((acc, validateSchema) => {
        const isValid = ValidationResult.isValid(validateSchema(value));
        return acc ? !isValid : isValid;
      }, false)
    ];
  },
  "not": (schema, memo) => {
    const pointer = JsonSpec.pointer(schema);
    const validateSchema = validate(schema, memo);
    return (schema) => [pointer, !ValidationResult.isValid(validateSchema(schema))];
  }
};

JsonSpec.validate = (schema) => validate(schema, {});

export default JsonSpec;
