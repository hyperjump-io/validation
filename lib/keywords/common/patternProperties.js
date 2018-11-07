import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const type = "object";

export const compile = async (doc, memo) => await JsonValidation.entries(doc)
  .map(async ([propertyPattern, propertyDoc]) => {
    await Core.compile(propertyDoc, memo);
    return [new RegExp(propertyPattern), propertyDoc.url];
  });

export const interpret = (patternProperties, value, memo) => patternProperties
  .every(([pattern, property]) => Object.keys(value)
    .filter((propertyName) => pattern.test(propertyName))
    .every((propertyName) => {
      const result = Core.interpret(memo, property)(value[propertyName]);
      return ValidationResult.isValid(result);
    }));
