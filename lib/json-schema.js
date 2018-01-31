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
  "const": (schema, value) => {
    const expectedValue = JsonSchema.value(schema);
    return jsonStringify(value) === jsonStringify(expectedValue);
  },
  "type": (schema, value) => {
    const type = JsonSchema.value(schema);
    return typeOf(value) === type;
  },
  "maxLength": (schema, value) => {
    const length = JsonSchema.value(schema);
    return typeOf(value) !== "string" || value.length <= length;
  },
  "minLength": (schema, value) => {
    const length = JsonSchema.value(schema);
    return typeOf(value) !== "string" || value.length >= length;
  },
  "items": (schema, value) => {
    return typeOf(value) !== "array" || value.every((item) => JsonSchema.validate(schema, item));
  },
  "properties": (schema, value) => {
    const propertySchemas = JsonSchema.value(schema);
    return typeOf(value) !== "object" || Object.keys(propertySchemas)
      .filter((propertyName) => value[propertyName])
      .every((propertyName) => {
        const url = JsonPointer.append(schema.url, propertyName);
        const propertySchema = JsonSchema.get(schema, url);
        return JsonSchema.validate(propertySchema, value[propertyName])
      });
  }
};

JsonSchema.validate = (schema, value) => {
  return Object.keys(JsonSchema.value(schema))
    .filter((keyword) => validators[keyword])
    .every((keyword) => {
      const url = JsonPointer.append(schema.url, keyword);
      return validators[keyword](JsonSchema.get(schema, url), value)
    });
};

module.exports = JsonSchema;
