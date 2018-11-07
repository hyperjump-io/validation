import * as Core from "~/json-validation-core";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


export const type = "object";

export const compile = async (doc) => {
  const meta = await Core.metaCompile(doc);
  return [JsonValidation.value(doc), meta];
};

export const interpret = ([validation, meta], value) => {
  if (!validation) {
    return true;
  }

  const result = Core.metaInterpret(meta, value);
  return ValidationResult.isValid(result);
};
