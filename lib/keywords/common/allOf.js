const Hyperjump = require("@hyperjump/browser");
const Validation = require("../../core");


const compile = async (doc, ast) => {
  return Hyperjump.pipeline([
    Hyperjump.map(async (subDoc) => {
      await Validation.compile(subDoc, ast);
      return subDoc.$url;
    }),
    Hyperjump.all
  ], doc);
};

const interpret = (allOf, doc, ast, memo) => {
  return Hyperjump.every(async (subDoc) => {
    const result = await Validation.interpret(ast, subDoc)(doc, memo);
    return Validation.isValid(result);
  }, allOf);
};

module.exports = { compile, interpret };
