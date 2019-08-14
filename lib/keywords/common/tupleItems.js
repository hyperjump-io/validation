const Pact = require("@hyperjump/pact");
const Validation = require("../../core");


const type = "array";

const compile = (doc, ast) => {
  return Pact.pipeline([
    Pact.map(async (itemDoc) => {
      await Validation.compile(itemDoc, ast);
      return itemDoc.$url;
    }),
    Pact.all
  ], doc);
};

const interpret = (tupleItems, doc, ast, memo) => {
  return Pact.every(async (item, ndx) => {
    if (!(ndx in tupleItems)) {
      return true;
    }

    const result = await Validation.interpret(ast, tupleItems[ndx])(item, memo);
    return Validation.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
