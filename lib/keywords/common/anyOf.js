const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await JVal.map(async (subDoc) => {
  await JVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (anyOf, value, ast) => {
  return anyOf.some((url) => {
    const result = JVal.interpret(ast, url)(value);
    return ValidationResult.isValid(result);
  });
};

module.exports = { compile, interpret };
