const Core = require("../../json-validation-core");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => {
  await Core.compile(doc, ast);
  return doc.url;
};

const interpret = (propertyNames, value, ast) => Object.keys(value)
  .every((name) => {
    const result = Core.interpret(ast, propertyNames)(name);
    return ValidationResult.isValid(result);
  });

module.exports = { type, compile, interpret };
