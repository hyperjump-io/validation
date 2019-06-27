const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "array";

const compile = async (doc, ast) => {
  await JVal.compile(doc, ast);
  return doc.url;
};

const interpret = (items, doc, ast, memo) => {
  return Hyperjump.every(async (item) => {
    const result = await JVal.interpret(ast, items, memo)(item);
    return ValidationResult.isValid(result);
  }, doc);
};

module.exports = { type, compile, interpret };
