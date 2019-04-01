const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc) => {
  const meta = await JVal.metaCompile(doc);
  return [JVal.value(doc), meta];
};

const interpret = ([validation, meta], value) => {
  if (!validation) {
    return true;
  }

  const result = JVal.metaInterpret(meta, value);
  return ValidationResult.isValid(result);
};

module.exports = { type, compile, interpret };
