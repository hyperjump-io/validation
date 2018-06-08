const JsonPointer = require("./json-pointer");
const JsonReference = require("./json-reference");
const ValidationResult = require("./validation-result");
const jsonStringify = require("json-stable-stringify");


const JsonSchema = JsonReference;

const validate = (schema, memo) => {
  if (!memo[schema.url]) {
    memo[schema.url] = (value) => false;

    const validatorList = Object.keys(JsonSchema.value(schema))
      .filter((keyword) => validators[keyword])
      .map((keyword) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(keyword));
        return validators[keyword](JsonSchema.get(schema, url), memo);
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
    const pointer = JsonSchema.pointer(schema);
    const expectedValue = JsonSchema.value(schema);
    return (value) => [pointer, jsonStringify(value) === jsonStringify(expectedValue)];
  },
  "type": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const type = JsonSchema.value(schema);
    return (value) => [pointer, isType[type](value)];
  },
  "multipleOf": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const multipleOf = JsonSchema.value(schema);

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
    const pointer = JsonSchema.pointer(schema);
    const maximum = JsonSchema.value(schema);
    return (value) => [pointer, typeof value !== "number" || value <= maximum];
  },
  "exclusiveMaximum": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const exclusiveMaximum = JsonSchema.value(schema);
    return (value) => [pointer, typeof value !== "number" || value < exclusiveMaximum];
  },
  "minimum": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const minimum = JsonSchema.value(schema);
    return (value) => [pointer, typeof value !== "number" || value >= minimum];
  },
  "exclusiveMinimum": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const exclusiveMinimum = JsonSchema.value(schema);
    return (value) => [pointer, typeof value !== "number" || value > exclusiveMinimum];
  },
  "maxLength": (schema) => {
    // TODO: Handle emojis correctly
    const pointer = JsonSchema.pointer(schema);
    const length = JsonSchema.value(schema);
    return (value) => [pointer, typeof value !== "string" || value.length <= length];
  },
  "minLength": (schema) => {
    // TODO: Handle emojis correctly
    const pointer = JsonSchema.pointer(schema);
    const length = JsonSchema.value(schema);
    return (value) => [pointer, typeof value !== "string" || value.length >= length];
  },
  "pattern": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const pattern = new RegExp(JsonSchema.value(schema));
    return (value) => [pointer, typeof value !== "string" || pattern.test(value)];
  },
  "format": (schema) => {
    // TODO: implement me
    const pointer = JsonSchema.pointer(schema);
    return (value) => [pointer, true];
  },
  "items": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const validateItem = validate(schema, memo);
    return (value) => [
      pointer,
      !Array.isArray(value) || value.every((item) => ValidationResult.isValid(validateItem(item)))
    ];
  },
  "tupleItems": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const tupleItems = JsonSchema.value(schema)
      .map((_, ndx) => JsonSchema.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((itemSchema) => validate(itemSchema, memo));

    return (value) => [
      pointer,
      !Array.isArray(value) || value.every((item, ndx) => ValidationResult.isValid(tupleItems[ndx](item)))
    ];
  },
  "maxItems": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const maxItems = JsonSchema.value(schema);
    return (value) => [pointer, !Array.isArray(value) || value.length <= maxItems];
  },
  "minItems": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const minItems = JsonSchema.value(schema);
    return (value) => [pointer, !Array.isArray(value) || value.length >= minItems];
  },
  "uniqueItems": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const uniqueItems = JsonSchema.value(schema);
    return (value) => {
      if (!Array.isArray(value)) {
        return [pointer, true];
      }

      const normalizedItems = value.map(jsonStringify);
      return [pointer, (new Set(normalizedItems)).size === normalizedItems.length];
    }
  },
  "properties": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const propertySchemas = JsonSchema.value(schema);
    const propertyValidators = Object.keys(propertySchemas)
      .reduce((propertyValidators, propertyName) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(propertyName));
        const propertySchema = JsonSchema.get(schema, url);
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
    const pointer = JsonSchema.pointer(schema);
    const patternProperties = JsonSchema.value(schema);
    const validators = Object.keys(patternProperties)
      .map((propertyPattern) => {
        const url = JsonPointer.append(schema.url, encodeURIComponent(propertyPattern));
        const propertySchema = JsonSchema.get(schema, url);
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
    }
  },
  "propertyNames": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const validateName = validate(schema, memo);
    return (value) => [
      pointer,
      !isObject(value) || Object.keys(value)
        .every((name) => ValidationResult.isValid(validateName(name)))
    ];
  },
  "maxProperties": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const maxProperties = JsonSchema.value(schema);
    return (value) => [pointer, !isObject(value) || Object.keys(value).length <= maxProperties];
  },
  "minProperties": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const minProperties = JsonSchema.value(schema);
    return (value) => [pointer, !isObject(value) || Object.keys(value).length >= minProperties];
  },
  "required": (schema) => {
    const pointer = JsonSchema.pointer(schema);
    const required = JsonSchema.value(schema);
    return (value) => [pointer, !isObject(value) || required.every((propertyName) => propertyName in value)];
  },
  "allOf": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const allOf = JsonSchema.value(schema)
      .map((_, ndx) => JsonSchema.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => validate(subSchema, memo))

    return (value) => [pointer, allOf.every((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "anyOf": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const anyOf = JsonSchema.value(schema)
      .map((_, ndx) => JsonSchema.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((subSchema) => validate(subSchema, memo));

    return (value) => [pointer, anyOf.some((validateSchema) => ValidationResult.isValid(validateSchema(value)))];
  },
  "oneOf": (schema, memo) => {
    const pointer = JsonSchema.pointer(schema);
    const oneOf = JsonSchema.value(schema)
      .map((_, ndx) => JsonSchema.get(schema, JsonPointer.append(schema.url, ndx)))
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
    const pointer = JsonSchema.pointer(schema);
    const validateSchema = validate(schema, memo);
    return (schema) => [pointer, !ValidationResult.isValid(validateSchema(schema))];
  }
};

JsonSchema.validate = (schema) => validate(schema, {});

module.exports = JsonSchema;
