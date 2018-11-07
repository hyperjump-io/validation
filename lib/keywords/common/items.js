import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const type = "array";

export const compile = async (doc, memo) => {
  await Core.compile(doc, memo);
  return doc.url;
};

export const interpret = (items, value, memo) => value.every((item) => {
  const result = Core.interpret(memo, items)(item);
  return ValidationResult.isValid(result);
});
