const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const type = "array";

const compile = async (doc, ast) => await Hyperjump.map(async (itemDoc) => {
  await HVal.compile(itemDoc, ast);
  return itemDoc.url;
}, doc);

const interpret = (tupleItems, doc, ast, memo) => {
  return Hyperjump.every(async (item, ndx) => {
    if (!(ndx in tupleItems)) {
      return true;
    }

    const result = await HVal.interpret(ast, tupleItems[ndx], memo)(item);
    return HVal.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
