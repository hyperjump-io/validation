import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, memo) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, memo);
  return subDoc.url;
}, doc);

export const interpret = (oneOf, value, memo) => oneOf.reduce((acc, subDoc) => {
  const result = Core.interpret(memo, subDoc)(value);
  const isValid = ValidationResult.isValid(result);
  return acc ? !isValid : isValid;
}, false);
