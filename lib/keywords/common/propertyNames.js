import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const type = "object";

export const compile = async (doc, memo) => {
  await Core.compile(doc, memo);
  return doc.url;
};

export const interpret = (propertyNames, value, memo) => Object.keys(value)
  .every((name) => {
    const result = Core.interpret(memo, propertyNames)(name);
    return ValidationResult.isValid(result);
  });
