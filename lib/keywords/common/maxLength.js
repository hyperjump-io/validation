import * as JsonValidation from "~/json-validation";
import { jsonStringLength } from "~/json-validation-common";


export const type = "string";
export const compile = async (doc) => JsonValidation.value(doc);
export const interpret = (maxLength, value) => jsonStringLength(value) <= maxLength;