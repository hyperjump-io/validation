import * as JsonValidation from "~/json-validation";


export const type = "object";
export const compile = async (doc) => JsonValidation.value(doc);
export const interpret = (minProperties, value) => Object.keys(value).length >= minProperties;
