const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "array";

const compile = async (doc, ast) => await JVal.map(async (itemDoc) => {
  await JVal.compile(itemDoc, ast);
  return itemDoc.url;
}, doc);

const interpret = (tupleItems, value, ast) => value.every((item, ndx) => {
  if (!(ndx in tupleItems)) {
    return true;
  }

  const result = JVal.interpret(ast, tupleItems[ndx])(item);
  return ValidationResult.isValid(result);
});

module.exports = { type, compile, interpret };
