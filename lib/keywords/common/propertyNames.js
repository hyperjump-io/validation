import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";


export const type = "object";

export const compile = async (doc, ast) => {
  await Core.compile(doc, ast);
  return doc.url;
};

export const interpret = (propertyNames, value, ast) => Object.keys(value)
  .every((name) => {
    const result = Core.interpret(ast, propertyNames)(name);
    return ValidationResult.isValid(result);
  });
