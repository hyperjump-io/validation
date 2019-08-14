const Pact = require("@hyperjump/pact");
const Validation = require("../../core");


const compile = (doc, ast) => {
  return Pact.pipeline([
    Pact.map(async (subDoc) => {
      await Validation.compile(subDoc, ast);
      return subDoc.$url;
    }),
    Pact.all
  ], doc);
};

const interpret = (oneOf, doc, ast, memo) => {
  return Pact.reduce(async (acc, subDoc) => {
    const result = await Validation.interpret(ast, subDoc)(doc, memo);
    const isValid = Validation.isValid(result);
    return acc ? !isValid : isValid;
  }, false, oneOf);
};

module.exports = { compile, interpret };
