import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, memo) => {
  await Core.compile(doc, memo);
  return doc.url;
};

export const interpret = (not, value, memo) => {
  const result = Core.interpret(memo, not)(value);
  return !ValidationResult.isValid(result);
};
