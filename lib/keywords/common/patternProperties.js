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

const interpret = (patternProperties, value, ast) => patternProperties
  .every(([pattern, property]) => Object.keys(value)
    .filter((propertyName) => pattern.test(propertyName))
    .every((propertyName) => {
      const result = JVal.interpret(ast, property)(value[propertyName]);
      return ValidationResult.isValid(result);
    }));

module.exports = { type, compile, interpret };
