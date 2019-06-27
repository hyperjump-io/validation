const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc) => {
  const meta = await JVal.metaCompile(doc);
  return [JVal.value(doc), meta];
};

const interpret = async ([validation, meta], doc, ast, memo) => {
  if (!validation) {
    return true;
  }

  const result = await JVal.metaInterpret(meta, doc, memo);
  return ValidationResult.isValid(result);
};

module.exports = { type, compile, interpret };
