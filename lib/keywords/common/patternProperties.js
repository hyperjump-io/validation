import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const type = "object";

export const compile = async (doc, ast) => await JsonValidation.entries(doc)
  .map(async ([propertyPattern, propertyDoc]) => {
    await Core.compile(propertyDoc, ast);
    return [new RegExp(propertyPattern), propertyDoc.url];
  });

export const interpret = (patternProperties, value, ast) => patternProperties
  .every(([pattern, property]) => Object.keys(value)
    .filter((propertyName) => pattern.test(propertyName))
    .every((propertyName) => {
      const result = Core.interpret(ast, property)(value[propertyName]);
      return ValidationResult.isValid(result);
    }));
