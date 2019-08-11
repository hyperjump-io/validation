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

const interpret = (oneOf, doc, ast, memo) => {
  return Hyperjump.reduce(async (acc, subDoc) => {
    const result = await Validation.interpret(ast, subDoc)(doc, memo);
    const isValid = Validation.isValid(result);
    return acc ? !isValid : isValid;
  }, false, oneOf);
};

module.exports = { compile, interpret };
