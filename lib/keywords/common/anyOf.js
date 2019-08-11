const Hyperjump = require("@hyperjump/browser");
const Validation = require("../../core");


const compile = (doc, ast) => {
  return Hyperjump.pipeline([
    Hyperjump.map(async (subDoc) => {
      await Validation.compile(subDoc, ast);
      return subDoc.$url;
    }),
    Hyperjump.all
  ], doc);
};

const interpret = (anyOf, doc, ast, memo) => {
  return Hyperjump.some(async (url) => {
    const result = await Validation.interpret(ast, url)(doc, memo);
    return Validation.isValid(result);
  }, anyOf);
};

module.exports = { compile, interpret };
