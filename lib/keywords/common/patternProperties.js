const Core = require("../../core");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


const type = "object";

const compile = async (doc, ast) => JsonValidation.pipeline([
  JsonValidation.entries,
  JsonValidation.map(async ([propertyPattern, propertyDoc]) => {
    await Core.compile(propertyDoc, ast);
    return [new RegExp(propertyPattern), propertyDoc.url];
  })
], doc);

const interpret = (patternProperties, value, ast) => patternProperties
  .every(([pattern, property]) => Object.keys(value)
    .filter((propertyName) => pattern.test(propertyName))
    .every((propertyName) => {
      const result = Core.interpret(ast, property)(value[propertyName]);
      return ValidationResult.isValid(result);
    }));

module.exports = { type, compile, interpret };
