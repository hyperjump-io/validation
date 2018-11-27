import jsonStringify from "fastest-stable-stringify";
import * as JsonValidation from "~/json-validation";


export const compile = async (doc) => jsonStringify(JsonValidation.value(doc));
export const interpret = (constValue, value) => jsonStringify(value) === constValue;
