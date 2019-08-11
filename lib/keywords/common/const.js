const jsonStringify = require("fastest-stable-stringify");
const { isObject } = require("../../common");


const compile = async (doc) => jsonStringify(await doc.$source);

const interpret = async (constValue, doc) => {
  const docValue = isObject(doc) && await doc.$url ? await doc.$source : await doc;
  return jsonStringify(docValue) === constValue;
};

module.exports = { compile, interpret };
