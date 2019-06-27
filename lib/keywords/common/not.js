const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => {
  await JVal.compile(doc, ast);
  return doc.url;
};

const interpret = async (not, doc, ast, memo) => {
  const result = await JVal.interpret(ast, not, memo)(doc);
  return !ValidationResult.isValid(result);
};

module.exports = { compile, interpret };
