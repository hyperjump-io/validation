const JsonPointer = require("@hyperjump/json-pointer");
const Hyperjump = require("@hyperjump/browser");
const { isType, isObject } = require("./common");


const validate = async (d) => {
  const doc = await d;
  const meta = await metaCompile(doc);
  const result = await metaInterpret(meta, doc, new Set());

  if (!isValid(result)) {
    throw result;
  }

  const ast = await compile(doc, {});
  return interpret(ast, doc.url, new Set());
};

const compile = async (doc, ast) => {
  if (!(doc.url in ast)) {
    ast[doc.url] = false;

    const meta = await getMeta(doc);

    ast[doc.url] = await Hyperjump.pipeline([
      Hyperjump.entries,
      Hyperjump.filter(([keyword]) => keyword !== "$meta"),
      Hyperjump.map(async ([keyword, keywordDoc]) => {
        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${keywordDoc.url}'`);
        }

        const keywordUrl = meta[keyword];
        const node = await keywords[keywordUrl].compile(keywordDoc, ast);

        return [keywordUrl, keywordDoc.url, node];
      })
    ], doc);
  }

  return ast;
};

const metaAst = {};
const metaCompile = async (doc) => {
  const meta = await getMeta(doc);

  await Promise.all(Object.entries(meta)
    .filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaAst))
    .map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = await Hyperjump.get(keywordUrl, Hyperjump.nil);
      return await compile(metaDoc, metaAst);
    }));

  return meta;
};

const isDocument = (value) => isObject(value) && "url" in value;
const interpret = (ast, url, memo) => async (d) => {
  const doc = await d;
  // Cycle protection
  if (isDocument(doc)) {
    const docKey = `${url}--${doc.url}`;
    if (memo.has(docKey)) {
      return [];
    } else {
      memo.add(docKey);
    }
  }

  return Hyperjump.map(async ([keywordUrl, ptr, keywordValue]) => {
    const keyword = keywords[keywordUrl];
    const isValid = (keyword.type !== undefined && !isType[keyword.type](Hyperjump.value(doc))) || await keyword.interpret(keywordValue, doc, ast, memo);

    return [ptr, isValid];
  }, ast[url]);
};

const metaInterpret = (meta, doc, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.filter(([keyword]) => keyword in meta),
    Hyperjump.map(async ([keyword, keywordValue]) => {
      const keywordUrl = meta[keyword];
      const result = await interpret(metaAst, keywordUrl, memo)(keywordValue);
      return [JsonPointer.append(keyword, JsonPointer.nil), isValid(result)];
    })
  ], doc);
};

const getMeta = async (doc) => {
  try {
    const $meta = await Hyperjump.get("#/$meta", doc);
    return Hyperjump.value($meta);
  } catch (e) {
    return {};
  }
};

const isValid = (result) => result.every(([_pointer, isValid]) => isValid);

const keywords = {};

const addKeyword = (url, keywordDefinition) => keywords[url] = keywordDefinition;

module.exports = { compile, metaCompile, interpret, metaInterpret, addKeyword, validate, isValid };
