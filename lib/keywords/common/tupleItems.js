const Hyperjump = require("@hyperjump/browser");
const Validation = require("../../core");


const type = "array";

const compile = (doc, ast) => {
  return Hyperjump.pipeline([
    Hyperjump.map(async (itemDoc) => {
      await Validation.compile(itemDoc, ast);
      return itemDoc.$url;
    }),
    Hyperjump.all
  ], doc);
};

const interpret = (tupleItems, doc, ast, memo) => {
  return Hyperjump.every(async (item, ndx) => {
    if (!(ndx in tupleItems)) {
      return true;
    }

    const result = await Validation.interpret(ast, tupleItems[ndx])(item, memo);
    return Validation.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
