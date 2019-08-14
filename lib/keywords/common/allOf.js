const Pact = require("@hyperjump/pact");
const Validation = require("../../core");


const compile = async (doc, ast) => {
  return Pact.pipeline([
    Pact.map(async (subDoc) => {
      await Validation.compile(subDoc, ast);
      return subDoc.$url;
    }),
    Pact.all
  ], doc);
};

const interpret = (allOf, doc, ast, memo) => {
  return Pact.every(async (subDoc) => {
    const result = await Validation.interpret(ast, subDoc)(doc, memo);
    return Validation.isValid(result);
  }, allOf);
};

module.exports = { compile, interpret };
