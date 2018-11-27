import jsonStringify from "fastest-stable-stringify";
import * as JsonValidation from "~/json-validation";


export const type = "array";

export const compile = async (doc) => JsonValidation.value(doc);

export const interpret = (uniqueItems, value) => {
  if (uniqueItems === false) {
    return true;
  }

  const normalizedItems = value.map(jsonStringify);
  return (new Set(normalizedItems)).size === normalizedItems.length;
};
