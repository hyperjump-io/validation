const Core = require("../../json-validation-core");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (allOf, value, ast) => allOf.every((subDoc) => {
  const result = Core.interpret(ast, subDoc)(value);
  return ValidationResult.isValid(result);
});

module.exports = { compile, interpret };
