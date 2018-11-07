import * as JsonReference from "@hyperjump/json-reference";
import * as Core from "~/json-validation-core";
import * as ValidationResult from "~/validation-result";

import * as const_ from "~/keywords/common/const";
import * as type from "~/keywords/common/type";
import * as multipleOf from "~/keywords/common/multipleOf";
import * as maximum from "~/keywords/common/maximum";
import * as exclusiveMaximum from "~/keywords/common/exclusiveMaximum";
import * as minimum from "~/keywords/common/minimum";
import * as exclusiveMinimum from "~/keywords/common/exclusiveMinimum";
import * as maxLength from "~/keywords/common/maxLength";
import * as minLength from "~/keywords/common/minLength";
import * as pattern from "~/keywords/common/pattern";
import * as items from "~/keywords/common/items";
import * as tupleItems from "~/keywords/common/tupleItems";
import * as maxItems from "~/keywords/common/maxItems";
import * as minItems from "~/keywords/common/minItems";
import * as uniqueItems from "~/keywords/common/uniqueItems";
import * as properties from "~/keywords/common/properties";
import * as patternProperties from "~/keywords/common/patternProperties";
import * as propertyNames from "~/keywords/common/propertyNames";
import * as maxProperties from "~/keywords/common/maxProperties";
import * as minProperties from "~/keywords/common/minProperties";
import * as required from "~/keywords/common/required";
import * as allOf from "~/keywords/common/allOf";
import * as anyOf from "~/keywords/common/anyOf";
import * as oneOf from "~/keywords/common/oneOf";
import * as not from "~/keywords/common/not";
import * as definitions from "~/keywords/common/definitions";
import * as validation from "~/keywords/common/validation";


export const nil = JsonReference.nil;
export const value = JsonReference.value;
export const pointer = JsonReference.pointer;
export const get = JsonReference.get;
export const map = JsonReference.map;
export const entries = JsonReference.entries;

export const validate = async (doc) => {
  const meta = await Core.metaCompile(doc);
  const result = Core.metaInterpret(meta, value(doc));

  if (!ValidationResult.isValid(result)) {
    throw result;
  }

  const memo = await Core.compile(doc, {});
  return Core.interpret(memo, doc.url);
};

Core.addKeyword("http://validation.hyperjump.io/common/const", const_);
Core.addKeyword("http://validation.hyperjump.io/common/type", type);
Core.addKeyword("http://validation.hyperjump.io/common/multipleOf", multipleOf);
Core.addKeyword("http://validation.hyperjump.io/common/maximum", maximum);
Core.addKeyword("http://validation.hyperjump.io/common/exclusiveMaximum", exclusiveMaximum);
Core.addKeyword("http://validation.hyperjump.io/common/minimum", minimum);
Core.addKeyword("http://validation.hyperjump.io/common/exclusiveMinimum", exclusiveMinimum);
Core.addKeyword("http://validation.hyperjump.io/common/maxLength", maxLength);
Core.addKeyword("http://validation.hyperjump.io/common/minLength", minLength);
Core.addKeyword("http://validation.hyperjump.io/common/pattern", pattern);
Core.addKeyword("http://validation.hyperjump.io/common/items", items);
Core.addKeyword("http://validation.hyperjump.io/common/tupleItems", tupleItems);
Core.addKeyword("http://validation.hyperjump.io/common/maxItems", maxItems);
Core.addKeyword("http://validation.hyperjump.io/common/minItems", minItems);
Core.addKeyword("http://validation.hyperjump.io/common/uniqueItems", uniqueItems);
Core.addKeyword("http://validation.hyperjump.io/common/properties", properties);
Core.addKeyword("http://validation.hyperjump.io/common/patternProperties", patternProperties);
Core.addKeyword("http://validation.hyperjump.io/common/propertyNames", propertyNames);
Core.addKeyword("http://validation.hyperjump.io/common/maxProperties", maxProperties);
Core.addKeyword("http://validation.hyperjump.io/common/minProperties", minProperties);
Core.addKeyword("http://validation.hyperjump.io/common/required", required);
Core.addKeyword("http://validation.hyperjump.io/common/allOf", allOf);
Core.addKeyword("http://validation.hyperjump.io/common/anyOf", anyOf);
Core.addKeyword("http://validation.hyperjump.io/common/oneOf", oneOf);
Core.addKeyword("http://validation.hyperjump.io/common/not", not);
Core.addKeyword("http://validation.hyperjump.io/common/definitions", definitions);
Core.addKeyword("http://validation.hyperjump.io/common/validation", validation);
