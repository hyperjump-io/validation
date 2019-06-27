const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => JVal.pipeline([
  JVal.entries,
  JVal.map(async ([propertyPattern, propertyDoc]) => {
    await JVal.compile(propertyDoc, ast);
    return [new RegExp(propertyPattern), propertyDoc.url];
  })
], doc);

const interpret = (patternProperties, doc, ast, memo) => {
  return Hyperjump.every(([pattern, property]) => {
    return Hyperjump.pipeline([
      Hyperjump.entries,
      Hyperjump.filter(([propertyName]) => pattern.test(propertyName)),
      Hyperjump.every(async ([, propertyValue]) => {
        const result = await JVal.interpret(ast, property, memo)(propertyValue);
        return ValidationResult.isValid(result);
      })
    ], doc);
  }, patternProperties);
};

module.exports = { type, compile, interpret };
