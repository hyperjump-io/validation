import * as JsonValidation from "~/json-validation";
import { isType } from "~/json-validation-common";


export const compile = async (doc) => JsonValidation.value(doc);
export const interpret = (type, value) => isType[type](value);
