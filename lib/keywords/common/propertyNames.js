const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => {
  await JVal.compile(doc, ast);
  return doc.url;
};

const interpret = (propertyNames, value, ast) => Object.keys(value)
  .every((name) => {
    const result = JVal.interpret(ast, propertyNames)(name);
    return ValidationResult.isValid(result);
  });

module.exports = { type, compile, interpret };
