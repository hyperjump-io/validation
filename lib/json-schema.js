const JsonPointer = require("./json-pointer");


const typeValidators = {
  "null": (data) => data === null,
  "array": (data) => Array.isArray(data),
  "string": (data) => typeof data === "string",
  "object": (data) => typeof data === "object",
  "number": (data) => typeof data === "number",
  "integer": (data) => Number.isInteger(data),
};

const validators = {
  "type": (context, data, type) => typeValidators[type](data),
  "maxLength": (context, data, length) => typeof data !== "string" || data.length <= length,
  "minLength": (context, data, length) => typeof data !== "string" || data.length >= length,
  "properties": (context, data, propertySchema) => Object.keys(propertySchema)
    .filter((propertyName) => data[propertyName])
    .every((propertyName) => _validate(context, propertySchema[propertyName], data[propertyName])),
};

const _validate = (context, schema, data) => {
  if (schema["$ref"]) {
    const pointer = schema["$ref"].split("#")[1];
    schema = JsonPointer.get(pointer, context);
  }

  return Object.keys(schema)
    .filter((keyword) => validators[keyword])
    .every((keyword) => validators[keyword](context, data, schema[keyword]));
};

const validate = (schema, data) => {
  return _validate(schema, schema, data);
}

module.exports = { validate };
