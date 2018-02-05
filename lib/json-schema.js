const JsonPointer = require("./json-pointer");
const JsonReference = require("./json-reference");
const jsonStringify = require("json-stable-stringify");


const JsonSchema = JsonReference;

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
    const expectedValue = JsonSchema.value(schema);
    return (value) => jsonStringify(value) === jsonStringify(expectedValue);
  },
  "type": (schema) => {
    const validator = isType[JsonSchema.value(schema)];
    return validator;
  },
  "multipleOf": (schema) => {
    const multipleOf = JsonSchema.value(schema);

    return (value) => {
      if (typeof value !== "number") {
        return true;
      }

      const remainder = value % multipleOf;
      return remainder === 0 || multipleOf - remainder < Number.EPSILON || remainder < Number.EPSILON;
    };
  },
  "maximum": (schema) => {
    const maximum = JsonSchema.value(schema);
    return (value) => typeof value !== "number" || value <= maximum;
  },
  "exclusiveMaximum": (schema) => {
    const exclusiveMaximum = JsonSchema.value(schema);
    return (value) => typeof value !== "number" || value < exclusiveMaximum;
  },
  "minimum": (schema) => {
    const minimum = JsonSchema.value(schema);
    return (value) => typeof value !== "number" || value >= minimum;
  },
  "exclusiveMinimum": (schema) => {
    const exclusiveMinimum = JsonSchema.value(schema);
    return (value) => typeof value !== "number" || value > exclusiveMinimum;
  },
  "maxLength": (schema) => {
    const length = JsonSchema.value(schema);
    return (value) => typeof value !== "string" || value.length <= length;
  },
  "minLength": (schema) => {
    const length = JsonSchema.value(schema);
    return (value) => typeof value !== "string" || value.length >= length;
  },
  "pattern": (schema) => {
    const pattern = new RegExp(JsonSchema.value(schema));
    return (value) => typeof value !== "string" || pattern.test(value);
  },
  "items": (schema) => {
    const validator = JsonSchema.validate(schema);
    return (value) => !Array.isArray(value) || value.every((item) => validator(item));
  },
  "tupleItems": (schema) => {
    const tupleItems = JsonSchema.value(schema)
      .map((itemSchema, ndx) => JsonSchema.get(schema, JsonPointer.append(schema.url, ndx)))
      .map((itemSchema) => JsonSchema.validate(itemSchema));

    return (value) => !Array.isArray(value) || value.every((item, ndx) => tupleItems[ndx](item));
  },
  "maxItems": (schema) => {
    const maxItems = JsonSchema.value(schema);
    return (value) => !Array.isArray(value) || value.length <= maxItems;
  },
  "minItems": (schema) => {
    const minItems = JsonSchema.value(schema);
    return (value) => !Array.isArray(value) || value.length >= minItems;
  },
  "uniqueItems": (schema) => {
    const uniqueItems = JsonSchema.value(schema);
    return (value) => {
      if (!Array.isArray(value)) {
        return true;
      }

      const normalizedItems = value.map(jsonStringify);
      return (new Set(normalizedItems)).size === normalizedItems.length;
    }
  },
  "properties": (schema) => {
    const propertySchemas = JsonSchema.value(schema);
    const propertyValidators = Object.keys(propertySchemas)
      .reduce((propertyValidators, propertyName) => {
        const url = JsonPointer.append(schema.url, propertyName);
        const propertySchema = JsonSchema.get(schema, url);
        propertyValidators[propertyName] = JsonSchema.validate(propertySchema);
        return propertyValidators;
      }, {});

    return (value) => !isObject(value) || Object.keys(value)
      .filter((propertyName) => propertyValidators[propertyName])
      .every((propertyName) => propertyValidators[propertyName](value[propertyName]));
  },
  "patternProperties": (schema) => {
    const patternProperties = JsonSchema.value(schema);
    const validators = Object.keys(patternProperties)
      .map((propertyPattern) => {
        const url = JsonPointer.append(schema.url, propertyPattern);
        const propertySchema = JsonSchema.get(schema, url);
        return [new RegExp(propertyPattern), JsonSchema.validate(propertySchema)];
      });

    return (value) => {
      if (!isObject(value)) {
        return true;
      }

      const propertyNames = Object.keys(value);
      return validators
        .every(([pattern, validator]) => propertyNames
          .filter((propertyName) => pattern.test(propertyName))
          .every((propertyName) => validator(value[propertyName])));
    }
  },
  "propertyNames": (schema) => {
    const validator = JsonSchema.validate(schema);
    return (value) => !isObject(value) || Object.keys(value)
      .every(validator);
  },
  "maxProperties": (schema) => {
    const maxProperties = JsonSchema.value(schema);
    return (value) => !isObject(value) || Object.keys(value).length <= maxProperties;
  },
  "minProperties": (schema) => {
    const minProperties = JsonSchema.value(schema);
    return (value) => !isObject(value) || Object.keys(value).length >= minProperties;
  },
  "required": (schema) => {
    const required = JsonSchema.value(schema);
    const validator = (property) => required.includes(property);
    return (value) => !isObject(value) || Object.keys(value)
      .every(validator);
  }
};

JsonSchema.validate = (schema) => {
  const validatorList = Object.keys(JsonSchema.value(schema))
    .filter((keyword) => validators[keyword])
    .map((keyword) => {
      const url = JsonPointer.append(schema.url, keyword);
      return validators[keyword](JsonSchema.get(schema, url))
    });

  return (value) => validatorList.every((validator) => validator(value));
};

module.exports = JsonSchema;
