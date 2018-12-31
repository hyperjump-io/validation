const Core = require("../../json-validation-core");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc) => {
  const meta = await Core.metaCompile(doc);
  return [JsonValidation.value(doc), meta];
};

const interpret = ([validation, meta], value) => {
  if (!validation) {
    return true;
  }

  const result = Core.metaInterpret(meta, value);
  return ValidationResult.isValid(result);
};

module.exports = { type, compile, interpret };
