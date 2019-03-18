const Hyperjump = require("@hyperjump/browser");
const JRef = require("@hyperjump/browser/json-reference");
const Core = require("./core");
const ValidationResult = require("./validation-result");
const curry = require("just-curry-it");


const nil = JRef.nil;
const source = JRef.source;
const value = JRef.value;
const pointer = JRef.pointer;
const pipeline = JRef.pipeline;

const get = curry(async (url, doc = nil, options = {}) => {
  const defaultHeaders = { "Accept": "application/validation+json" };
  const validationOptions = { ...options, headers: { ...defaultHeaders, ...options.headers } };
  return await JRef.get(url, doc, validationOptions);
});

const entries = (doc, options = {}) => {
  const defaultHeaders = { "Accept": "application/validation+json" };
  const validationOptions = { ...options, headers: { ...defaultHeaders, ...options.headers } };
  return JRef.entries(doc, validationOptions);
};

const map = curry((fn, doc, options = {}) => {
  const defaultHeaders = { "Accept": "application/validation+json" };
  const validationOptions = { ...options, headers: { ...defaultHeaders, ...options.headers } };
  return JRef.map(fn, doc, validationOptions);
});

const filter = curry((fn, doc, options = {}) => {
  const defaultHeaders = { "Accept": "application/validation+json" };
  const validationOptions = { ...options, headers: { ...defaultHeaders, ...options.headers } };
  return JRef.filter(fn, doc, validationOptions);
});

const reduce = curry((fn, doc, acc, options = {}) => {
  const defaultHeaders = { "Accept": "application/validation+json" };
  const validationOptions = { ...options, headers: { ...defaultHeaders, ...options.headers } };
  return JRef.reduce(fn, doc, acc, validationOptions);
});

const validate = async (doc) => {
  const meta = await Core.metaCompile(doc);
  const result = Core.metaInterpret(meta, value(doc));

  if (!ValidationResult.isValid(result)) {
    throw result;
  }

  const ast = await Core.compile(doc, {});
  return Core.interpret(ast, doc.url);
};

const contentType = "application/validation+json";
const contentTypeHandler = JRef.contentTypeHandler;
Hyperjump.addContentType(contentType, contentTypeHandler);

module.exports = {
  contentType, contentTypeHandler,
  nil, source, get,
  value, pointer, entries, map, filter, reduce, pipeline,
  validate
};

const keywordDomain = "http://validation.hyperjump.io/common";
Core.addKeyword(`${keywordDomain}/const`, require("./keywords/common/const"));
Core.addKeyword(`${keywordDomain}/type`, require("./keywords/common/type"));
Core.addKeyword(`${keywordDomain}/multipleOf`, require("./keywords/common/multipleOf"));
Core.addKeyword(`${keywordDomain}/maximum`, require("./keywords/common/maximum"));
Core.addKeyword(`${keywordDomain}/exclusiveMaximum`, require("./keywords/common/exclusiveMaximum"));
Core.addKeyword(`${keywordDomain}/minimum`, require("./keywords/common/minimum"));
Core.addKeyword(`${keywordDomain}/exclusiveMinimum`, require("./keywords/common/exclusiveMinimum"));
Core.addKeyword(`${keywordDomain}/maxLength`, require("./keywords/common/maxLength"));
Core.addKeyword(`${keywordDomain}/minLength`, require("./keywords/common/minLength"));
Core.addKeyword(`${keywordDomain}/pattern`, require("./keywords/common/pattern"));
Core.addKeyword(`${keywordDomain}/items`, require("./keywords/common/items"));
Core.addKeyword(`${keywordDomain}/tupleItems`, require("./keywords/common/tupleItems"));
Core.addKeyword(`${keywordDomain}/maxItems`, require("./keywords/common/maxItems"));
Core.addKeyword(`${keywordDomain}/minItems`, require("./keywords/common/minItems"));
Core.addKeyword(`${keywordDomain}/uniqueItems`, require("./keywords/common/uniqueItems"));
Core.addKeyword(`${keywordDomain}/properties`, require("./keywords/common/properties"));
Core.addKeyword(`${keywordDomain}/patternProperties`, require("./keywords/common/patternProperties"));
Core.addKeyword(`${keywordDomain}/propertyNames`, require("./keywords/common/propertyNames"));
Core.addKeyword(`${keywordDomain}/maxProperties`, require("./keywords/common/maxProperties"));
Core.addKeyword(`${keywordDomain}/minProperties`, require("./keywords/common/minProperties"));
Core.addKeyword(`${keywordDomain}/required`, require("./keywords/common/required"));
Core.addKeyword(`${keywordDomain}/allOf`, require("./keywords/common/allOf"));
Core.addKeyword(`${keywordDomain}/anyOf`, require("./keywords/common/anyOf"));
Core.addKeyword(`${keywordDomain}/oneOf`, require("./keywords/common/oneOf"));
Core.addKeyword(`${keywordDomain}/not`, require("./keywords/common/not"));
Core.addKeyword(`${keywordDomain}/definitions`, require("./keywords/common/definitions"));
Core.addKeyword(`${keywordDomain}/validation`, require("./keywords/common/validation"));
