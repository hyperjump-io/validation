import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, memo) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, memo);
  return subDoc.url;
}, doc);

export const interpret = (allOf, value, memo) => allOf.every((subDoc) => {
  const result = Core.interpret(memo, subDoc)(value);
  return ValidationResult.isValid(result);
});
