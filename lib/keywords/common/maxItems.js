import * as JsonValidation from "~/json-validation";


export const type = "array";
export const compile = async (doc) => JsonValidation.value(doc);
export const interpret = (maxItems, value) => value.length <= maxItems;
