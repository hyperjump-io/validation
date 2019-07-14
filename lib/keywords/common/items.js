const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const type = "array";

const compile = async (doc, ast) => {
  await HVal.compile(doc, ast);
  return doc.url;
};

const interpret = (items, doc, ast, memo) => {
  return Hyperjump.every(async (item) => {
    const result = await HVal.interpret(ast, items, memo)(item);
    return HVal.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
