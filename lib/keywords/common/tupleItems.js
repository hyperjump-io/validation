const Core = require("../../json-validation-core");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


const type = "array";

const compile = async (doc, ast) => await JsonValidation.map(async (itemDoc) => {
  await Core.compile(itemDoc, ast);
  return itemDoc.url;
}, doc);

const interpret = (tupleItems, value, ast) => value.every((item, ndx) => {
  if (!(ndx in tupleItems)) {
    return true;
  }

  const result = Core.interpret(ast, tupleItems[ndx])(item);
  return ValidationResult.isValid(result);
});

module.exports = { type, compile, interpret };
