import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const type = "array";

export const compile = async (doc, ast) => {
  await Core.compile(doc, ast);
  return doc.url;
};

export const interpret = (items, value, ast) => value.every((item) => {
  const result = Core.interpret(ast, items)(item);
  return ValidationResult.isValid(result);
});
