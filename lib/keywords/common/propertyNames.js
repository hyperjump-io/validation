const Hyperjump = require("@hyperjump/browser");
const JVal = require("../../core");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => {
  await JVal.compile(doc, ast);
  return doc.url;
};

const interpret = (propertyNames, doc, ast, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.every(async ([name]) => {
      const result = await JVal.interpret(ast, propertyNames, memo)(name);
      return ValidationResult.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
