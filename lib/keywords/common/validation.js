const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const type = "object";

const compile = async (doc) => {
  const meta = await HVal.metaCompile(doc);
  return [Hyperjump.value(doc), meta];
};

const interpret = async ([validation, meta], doc, ast, memo) => {
  if (!validation) {
    return true;
  }

  const result = await HVal.metaInterpret(meta, doc, memo);
  return HVal.isValid(result);
};

module.exports = { type, compile, interpret };
