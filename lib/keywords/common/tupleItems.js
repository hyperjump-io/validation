const Hyperjump = require("@hyperjump/browser");
const JVal = require("../../core");
const ValidationResult = require("../../validation-result");


const type = "array";

const compile = async (doc, ast) => await Hyperjump.map(async (itemDoc) => {
  await JVal.compile(itemDoc, ast);
  return itemDoc.url;
}, doc);

const interpret = (tupleItems, doc, ast, memo) => {
  return Hyperjump.every(async (item, ndx) => {
    if (!(ndx in tupleItems)) {
      return true;
    }

    const result = await JVal.interpret(ast, tupleItems[ndx], memo)(item);
    return ValidationResult.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
