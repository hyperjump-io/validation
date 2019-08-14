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

const interpret = (anyOf, doc, ast, memo) => {
  return Pact.some(async (url) => {
    const result = await Validation.interpret(ast, url)(doc, memo);
    return Validation.isValid(result);
  }, anyOf);
};

module.exports = { compile, interpret };
