import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const type = "array";

export const compile = async (doc, ast) => await JsonValidation.map(async (itemDoc) => {
  await Core.compile(itemDoc, ast);
  return itemDoc.url;
}, doc);

export const interpret = (tupleItems, value, ast) => value.every((item, ndx) => {
  if (!(ndx in tupleItems)) {
    return true;
  }

  const result = Core.interpret(ast, tupleItems[ndx])(item);
  return ValidationResult.isValid(result);
});
