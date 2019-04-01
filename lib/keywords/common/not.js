const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => {
  await JVal.compile(doc, ast);
  return doc.url;
};

const interpret = (not, value, ast) => {
  const result = JVal.interpret(ast, not)(value);
  return !ValidationResult.isValid(result);
};

module.exports = { compile, interpret };
