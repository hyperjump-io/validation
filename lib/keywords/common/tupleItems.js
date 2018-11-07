import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const type = "array";

export const compile = async (doc, memo) => await JsonValidation.map(async (itemDoc) => {
  await Core.compile(itemDoc, memo);
  return itemDoc.url;
}, doc);

export const interpret = (tupleItems, value, memo) => value.every((item, ndx) => {
  if (!(ndx in tupleItems)) {
    return true;
  }

  const result = Core.interpret(memo, tupleItems[ndx])(item);
  return ValidationResult.isValid(result);
});
