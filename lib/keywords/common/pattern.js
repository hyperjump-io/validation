import * as JsonValidation from "~/json-validation";


export const type = "string";
export const compile = async (doc) => new RegExp(JsonValidation.value(doc));
export const interpret = (pattern, value) => pattern.test(value);
