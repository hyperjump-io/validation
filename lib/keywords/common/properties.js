import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const type = "object";

export const compile = async (doc, memo) => await JsonValidation.entries(doc)
  .reduce(async (acc, [propertyName, propertyDoc]) => {
    await Core.compile(propertyDoc, memo);
    acc[propertyName] = propertyDoc.url;
    return acc;
  }, {});

export const interpret = (properties, value, memo) => Object.keys(value)
  .filter((propertyName) => propertyName in properties)
  .every((propertyName) => {
    const result = Core.interpret(memo, properties[propertyName])(value[propertyName]);
    return ValidationResult.isValid(result);
  });
