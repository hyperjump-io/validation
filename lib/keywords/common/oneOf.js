const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await JVal.map(async (subDoc) => {
  await JVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (oneOf, value, ast) => oneOf.reduce((acc, subDoc) => {
  const result = JVal.interpret(ast, subDoc)(value);
  const isValid = ValidationResult.isValid(result);
  return acc ? !isValid : isValid;
}, false);

module.exports = { compile, interpret };
