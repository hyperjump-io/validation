import * as JsonPointer from "@hyperjump/json-pointer";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";
import { isType } from "~/json-validation-common";


export const compile = async (doc, memo) => {
  if (memo[doc.url] === undefined) {
    memo[doc.url] = false;

    const $meta = await JsonReference.get("#/$meta", doc);
    const meta = JsonReference.value($meta) || {};

    memo[doc.url] = await JsonReference.entries(doc)
      .filter(([keyword, _]) => keyword !== "$meta")
      .map(async ([keyword, keywordDoc]) => {
        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${keywordDoc.url}'`);
        }

        const keywordUrl = meta[keyword];
        const node = await keywords[keywordUrl].compile(keywordDoc, memo);

        return [keywordUrl, keywordDoc.url, node];
      });
  }

  return memo;
};

const metaMemo = {};
export const metaCompile = async (doc) => {
  const $meta = await JsonReference.get("#/$meta", doc);
  const meta = JsonReference.value($meta) || {};

  await Promise.all(Object.entries(meta)
    .filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaMemo))
    .map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = await JsonReference.get(keywordUrl);
      return await compile(metaDoc, metaMemo);
    }));

  return meta;
};

export const interpret = (memo, url) => (value) => {
  return memo[url].map(([keywordUrl, ptr, keywordValue]) => {
    const keyword = keywords[keywordUrl];
    const isValid = (keyword.type !== undefined && !isType[keyword.type](value)) || keywords[keywordUrl].interpret(keywordValue, value, memo);

    return [ptr, isValid];
  });
};

export const metaInterpret = (meta, value) => {
  return Object.keys(value)
    .filter((keyword) => keyword in meta)
    .map((keyword) => {
      const keywordUrl = meta[keyword];
      const result = interpret(metaMemo, keywordUrl)(value[keyword]);
      return [JsonPointer.cons(JsonPointer.nil, keyword), ValidationResult.isValid(result)];
    });
};

const keywords = {};

export const addKeyword = (url, keywordDefinition) => keywords[url] = keywordDefinition;
