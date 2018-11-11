import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, ast) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, ast);
  return subDoc.url;
}, doc);

export const interpret = (allOf, value, ast) => allOf.every((subDoc) => {
  const result = Core.interpret(ast, subDoc)(value);
  return ValidationResult.isValid(result);
});
