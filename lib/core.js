const Hyperjump = require("@hyperjump/browser");
const Pact = require("@hyperjump/pact");
const { isType, isObject } = require("./common");


const validate = async (doc) => {
  const meta = await metaCompile(doc);
  const result = await metaInterpret(meta, doc);

  if (!isValid(result)) {
    throw result;
  }

  const ast = await compile(doc, {});
  return interpret(ast, await doc.$url);
};

const compile = async (doc, ast) => {
  const url = (await doc.$url).replace(/#$/, "");

  if (!(url in ast)) {
    ast[url] = false;

    const meta = await getMeta(doc);

    ast[url] = await Pact.pipeline([
      Pact.entries,
      Pact.filter(([keyword]) => keyword !== "$meta"),
      Pact.map(async ([keyword, keywordDoc]) => {
        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${await keywordDoc.$url}'`);
        }

        const keywordUrl = await meta[keyword];
        const compiledKeyword = await keywords[keywordUrl].compile(keywordDoc, ast);
        return [keywordUrl, await keywordDoc.$url, compiledKeyword];
      }),
      Pact.all
    ], doc);
  }

  return ast;
};

const metaAst = {};
const metaCompile = async (doc) => {
  const meta = await getMeta(doc);

  await Pact.pipeline([
    Pact.entries,
    Pact.filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaAst)),
    Pact.map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = Hyperjump.fetch(keywordUrl);
      return await compile(metaDoc, metaAst);
    }),
    Pact.all
  ], meta);

  return meta;
};

const interpret = (ast, url) => async (doc, memo = new Set()) => {
  url = url.replace(/#$/, "");

  // Cycle protection
  const docUrl = isObject(doc) ? await doc.$url : undefined;
  if (docUrl) {
    const docKey = `${url}--${docUrl}`;
    if (memo.has(docKey)) {
      return [];
    } else {
      memo.add(docKey);
    }
  }

  return Pact.pipeline([
    Pact.map(async ([keywordUrl, valueUrl, keywordValue]) => {
      const keyword = keywords[keywordUrl];
      const isValid = (keyword.type !== undefined && !isType[keyword.type](await doc)) || await keyword.interpret(keywordValue, doc, ast, memo);

      return [valueUrl, isValid];
    }),
    Pact.all
  ], ast[url]);
};

const metaInterpret = async (meta, doc, memo = new Set()) => {
  return Pact.pipeline([
    Pact.entries,
    Pact.filter(([keyword]) => keyword in meta),
    Pact.map(async ([keyword, keywordValue]) => {
      const keywordUrl = meta[keyword];
      const result = await interpret(metaAst, keywordUrl)(keywordValue, memo);
      return [await keywordValue.$url, isValid(result)];
    }),
    Pact.all
  ], doc);
};

const getMeta = async (doc) => {
  try {
    return Pact.allValues(await doc.$follow("#/$meta"));
  } catch (error) {
    return {};
  }
};

const isValid = (result) => result.every(([_pointer, isValid]) => isValid);

const keywords = {};

const addKeyword = (url, keywordDefinition) => keywords[url] = keywordDefinition;

module.exports = { compile, metaCompile, interpret, metaInterpret, addKeyword, validate, isValid };
