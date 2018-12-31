const JsonValidation = require("../../json-validation");
const Core = require("../../json-validation-core");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (anyOf, value, ast) => {
  return anyOf.some((url) => {
    const result = Core.interpret(ast, url)(value);
    return ValidationResult.isValid(result);
  });
};

module.exports = { compile, interpret };
