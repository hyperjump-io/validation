const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => await JVal.pipeline([
  JVal.entries,
  JVal.reduce(async (acc, [propertyName, propertyDoc]) => {
    await JVal.compile(propertyDoc, ast);
    acc[propertyName] = propertyDoc.url;
    return acc;
  }, {})
], doc);

const interpret = (properties, doc, ast, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.filter(([propertyName]) => propertyName in properties),
    Hyperjump.every(async ([propertyName, propertyValue]) => {
      const result = await JVal.interpret(ast, properties[propertyName], memo)(propertyValue);
      return ValidationResult.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
