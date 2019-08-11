const Hyperjump = require("@hyperjump/browser");
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
  const url = (await doc.$url);

  if (!(url in ast)) {
    ast[url] = false;

    const meta = await getMeta(doc);

    ast[url] = await Hyperjump.pipeline([
      Hyperjump.entries,
      Hyperjump.filter(([keyword]) => keyword !== "$meta"),
      Hyperjump.map(async ([keyword, keywordDoc]) => {
        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${await keywordDoc.$url}'`);
        }

        const keywordUrl = await meta[keyword];
        const compiledKeyword = await keywords[keywordUrl].compile(keywordDoc, ast);
        return [keywordUrl, await keywordDoc.$url, compiledKeyword];
      }),
      Hyperjump.all
    ], doc);
  }

  return ast;
};

const metaAst = {};
const metaCompile = async (doc) => {
  const meta = await getMeta(doc);

  await Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaAst)),
    Hyperjump.map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = Hyperjump.fetch(keywordUrl);
      return await compile(metaDoc, metaAst);
    }),
    Hyperjump.all
  ], meta);

  return meta;
};

const interpret = (ast, url) => async (doc, memo = new Set()) => {
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

  return Hyperjump.pipeline([
    Hyperjump.map(async ([keywordUrl, ptr, keywordValue]) => {
      const keyword = keywords[keywordUrl];
      const isValid = (keyword.type !== undefined && !isType[keyword.type](await doc)) || await keyword.interpret(keywordValue, doc, ast, memo);

      return [ptr, isValid];
    }),
    Hyperjump.all
  ], ast[url]);
};

const metaInterpret = async (meta, doc, memo = new Set()) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.filter(([keyword]) => keyword in meta),
    Hyperjump.map(async ([keyword, keywordValue]) => {
      const keywordUrl = meta[keyword];
      const result = await interpret(metaAst, keywordUrl)(keywordValue, memo);
      return [await keywordValue.$url, isValid(result)];
    }),
    Hyperjump.all
  ], doc);
};

const getMeta = async (doc) => {
  try {
    return Hyperjump.allValues(await doc.$follow("#/$meta"));
  } catch (error) {
    return {};
  }
};

const isValid = (result) => result.every(([_pointer, isValid]) => isValid);

const keywords = {};

const addKeyword = (url, keywordDefinition) => keywords[url] = keywordDefinition;

module.exports = { compile, metaCompile, interpret, metaInterpret, addKeyword, validate, isValid };
