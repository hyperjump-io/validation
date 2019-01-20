const Core = require("../../core");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (oneOf, value, ast) => oneOf.reduce((acc, subDoc) => {
  const result = Core.interpret(ast, subDoc)(value);
  const isValid = ValidationResult.isValid(result);
  return acc ? !isValid : isValid;
}, false);

module.exports = { compile, interpret };
