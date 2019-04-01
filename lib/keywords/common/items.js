const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "array";

const compile = async (doc, ast) => {
  await JVal.compile(doc, ast);
  return doc.url;
};

const interpret = (items, value, ast) => value.every((item) => {
  const result = JVal.interpret(ast, items)(item);
  return ValidationResult.isValid(result);
});

module.exports = { type, compile, interpret };
