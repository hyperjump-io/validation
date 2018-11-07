import * as JsonValidation from "~/json-validation";
import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, memo) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, memo);
  return subDoc.url;
}, doc);

export const interpret = (anyOf, value, memo) => {
  return anyOf.some((url) => {
    const result = Core.interpret(memo, url)(value);
    return ValidationResult.isValid(result);
  });
};
