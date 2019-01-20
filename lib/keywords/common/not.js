const Core = require("../../core");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => {
  await Core.compile(doc, ast);
  return doc.url;
};

const interpret = (not, value, ast) => {
  const result = Core.interpret(ast, not)(value);
  return !ValidationResult.isValid(result);
};

module.exports = { compile, interpret };
