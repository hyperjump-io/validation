const Core = require("../../json-validation-core");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => await JsonValidation.entries(doc)
  .reduce(async (acc, [propertyName, propertyDoc]) => {
    await Core.compile(propertyDoc, ast);
    acc[propertyName] = propertyDoc.url;
    return acc;
  }, {});

const interpret = (properties, value, ast) => Object.keys(value)
  .filter((propertyName) => propertyName in properties)
  .every((propertyName) => {
    const result = Core.interpret(ast, properties[propertyName])(value[propertyName]);
    return ValidationResult.isValid(result);
  });

module.exports = { type, compile, interpret };
