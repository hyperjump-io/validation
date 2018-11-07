import * as JsonValidation from "~/json-validation";


export const type = "number";
export const compile = async (doc) => JsonValidation.value(doc);
export const interpret =  (minimum, value) => value >= minimum;
