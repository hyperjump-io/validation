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

const interpret = (properties, value, ast) => Object.keys(value)
  .filter((propertyName) => propertyName in properties)
  .every((propertyName) => {
    const result = JVal.interpret(ast, properties[propertyName])(value[propertyName]);
    return ValidationResult.isValid(result);
  });

module.exports = { type, compile, interpret };
