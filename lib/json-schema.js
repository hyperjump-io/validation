const JsonPointer = require("./json-pointer");
const JsonReference = require("./json-reference");
const jsonStringify = require("json-stable-stringify");


const JsonSchema = JsonReference;

const typeOf = (value) => {
  if (value === null) {
    return "null";
  } else if (Array.isArray(value)) {
    return "array";
  } else if (Number.isInteger(value)) {
    return "integer";
  } else {
    return typeof value;
  }
}

const validators = {
  "const": (schema) => {
    const expectedValue = JsonSchema.value(schema);
    return (value) => jsonStringify(value) === jsonStringify(expectedValue);
  },
  "type": (schema) => {
    const type = JsonSchema.value(schema);
    return (value) => typeOf(value) === type;
  },
  "maxLength": (schema) => {
    const length = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "string" || value.length <= length;
  },
  "minLength": (schema) => {
    const length = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "string" || value.length >= length;
  },
  "pattern": (schema) => {
    const pattern = new RegExp(JsonSchema.value(schema));
    return (value) => typeOf(value) !== "string" || pattern.test(value);
  },
  "items": (schema) => {
    const validator = JsonSchema.validate(schema);
    return (value) => typeOf(value) !== "array" || value.every((item) => validator(item));
  },
  "maxItems": (schema) => {
    const maxItems = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "array" || value.length <= maxItems;
  },
  "minItems": (schema) => {
    const minItems = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "array" || value.length >= minItems;
  },
  "uniqueItems": (schema) => {
    const uniqueItems = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "array" || !uniqueItems || (new Set(value)).size === value.length;
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

    return (value) => typeOf(value) !== "object" || Object.keys(value)
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

    return (value) => typeOf(value) !== "object" || validators
      .every(([pattern, validator]) => Object.keys(value)
        .filter((propertyName) => pattern.test(propertyName))
        .every((propertyName) => validator(value[propertyName])));
  },
  "propertyNames": (schema) => {
    const validator = JsonSchema.validate(schema);
    return (value) => typeOf(value) !== "object" || Object.keys(value)
      .every(validator);
  },
  "maxProperties": (schema) => {
    const maxProperties = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "object" || Object.keys(value).length <= maxProperties;
  },
  "minProperties": (schema) => {
    const minProperties = JsonSchema.value(schema);
    return (value) => typeOf(value) !== "object" || Object.keys(value).length >= minProperties;
  },
  "required": (schema) => {
    const required = JsonSchema.value(schema);
    const validator = (property) => required.includes(property);
    return (value) => typeOf(value) !== "object" || Object.keys(value)
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
