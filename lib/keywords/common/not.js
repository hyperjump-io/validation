const Validation = require("../../core");


const compile = async (doc, ast) => {
  await Validation.compile(doc, ast);
  return doc.$url;
};

const interpret = async (not, doc, ast, memo) => {
  const result = await Validation.interpret(ast, not)(doc, memo);
  return !Validation.isValid(result);
};

module.exports = { compile, interpret };
