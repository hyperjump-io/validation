import * as JsonPointer from "@hyperjump/json-pointer";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";
import { isType } from "~/json-validation-common";


export const compile = async (doc, ast) => {
  if (ast[doc.url] === undefined) {
    ast[doc.url] = false;

    const $meta = await JsonReference.get("#/$meta", doc);
    const meta = JsonReference.value($meta) || {};

    ast[doc.url] = await JsonReference.entries(doc)
      .filter(([keyword, _]) => keyword !== "$meta")
      .map(async ([keyword, keywordDoc]) => {
        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${keywordDoc.url}'`);
        }

        const keywordUrl = meta[keyword];
        const node = await keywords[keywordUrl].compile(keywordDoc, ast);

        return [keywordUrl, keywordDoc.url, node];
      });
  }

  return ast;
};

const metaAst = {};
export const metaCompile = async (doc) => {
  const $meta = await JsonReference.get("#/$meta", doc);
  const meta = JsonReference.value($meta) || {};

  await Promise.all(Object.entries(meta)
    .filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaAst))
    .map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = await JsonReference.get(keywordUrl);
      return await compile(metaDoc, metaAst);
    }));

  return meta;
};

export const interpret = (ast, url) => (value) => {
  return ast[url].map(([keywordUrl, ptr, keywordValue]) => {
    const keyword = keywords[keywordUrl];
    const isValid = (keyword.type !== undefined && !isType[keyword.type](value)) || keywords[keywordUrl].interpret(keywordValue, value, ast);

    return [ptr, isValid];
  });
};

export const metaInterpret = (meta, value) => {
  return Object.keys(value)
    .filter((keyword) => keyword in meta)
    .map((keyword) => {
      const keywordUrl = meta[keyword];
      const result = interpret(metaAst, keywordUrl)(value[keyword]);
      return [JsonPointer.append(JsonPointer.nil, keyword), ValidationResult.isValid(result)];
    });
};

const keywords = {};

export const addKeyword = (url, keywordDefinition) => keywords[url] = keywordDefinition;