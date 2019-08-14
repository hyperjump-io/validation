const Pact = require("@hyperjump/pact");
const Validation = require("../../core");


const type = "array";

const compile = async (doc, ast) => {
  await Validation.compile(doc, ast);
  return doc.$url;
};

const interpret = (items, doc, ast, memo) => {
  return Pact.every(async (item) => {
    const result = await Validation.interpret(ast, items)(item, memo);
    return Validation.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
