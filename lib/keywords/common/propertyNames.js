const Hyperjump = require("@hyperjump/browser");
const Validation = require("../../core");


const type = "object";

const compile = async (doc, ast) => {
  await Validation.compile(doc, ast);
  return doc.$url;
};

const interpret = (propertyNames, doc, ast, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.every(async ([name]) => {
      const result = await Validation.interpret(ast, propertyNames)(name, memo);
      return Validation.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
