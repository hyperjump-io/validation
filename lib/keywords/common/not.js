import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const compile = async (doc, ast) => {
  await Core.compile(doc, ast);
  return doc.url;
};

export const interpret = (not, value, ast) => {
  const result = Core.interpret(ast, not)(value);
  return !ValidationResult.isValid(result);
};
