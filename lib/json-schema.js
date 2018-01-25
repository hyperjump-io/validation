const JsonReference = require("./json-reference");


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
  "type": (value, schema) => {
    const type = JsonSchema.value(schema);
    return typeOf(value) === type;
  },
  "maxLength": (value, schema) => {
    const length = JsonSchema.value(schema);
    return typeOf(value) !== "string" || value.length <= length;
  },
  "minLength": (value, schema) => {
    const length = JsonSchema.value(schema);
    return typeOf(value) !== "string" || value.length >= length;
  },
  "properties": (value, schema) => {
    const propertySchemas = JsonSchema.value(schema);
    return typeOf(value) !== "object" || Object.keys(propertySchemas)
      .filter((propertyName) => value[propertyName])
      .every((propertyName) => {
        const url = schema.url + "/" + propertyName;
        const propertySchema = JsonSchema.get(schema, url);
        return JsonSchema.validate(propertySchema, value[propertyName])
      });
  }
};

JsonSchema.validate = (schema, value) => {
  return Object.keys(JsonSchema.value(schema))
    .filter((keyword) => validators[keyword])
    .every((keyword) => {
      const url = schema.url + "/" + keyword;
      return validators[keyword](value, JsonSchema.get(schema, url))
    });
};

module.exports = JsonSchema;
