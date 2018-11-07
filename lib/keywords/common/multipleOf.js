import * as JsonValidation from "~/json-validation";
import { numberEqual } from "~/json-validation-common";


export const type = "number";

export const compile = async (doc) => JsonValidation.value(doc);

export const interpret = (multipleOf, value) => {
  const remainder = value % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};
