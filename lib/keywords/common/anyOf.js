import * as JsonValidation from "~/json-validation";
import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, ast) => await JsonValidation.map(async (subDoc) => {
  await Core.compile(subDoc, ast);
  return subDoc.url;
}, doc);

export const interpret = (anyOf, value, ast) => {
  return anyOf.some((url) => {
    const result = Core.interpret(ast, url)(value);
    return ValidationResult.isValid(result);
  });
};
