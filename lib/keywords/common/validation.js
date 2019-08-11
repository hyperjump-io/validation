const Validation = require("../../core");


const type = "object";

const compile = async (doc) => {
  const meta = await Validation.metaCompile(doc);
  return [await doc, meta];
};

const interpret = async ([validation, meta], doc, ast, memo) => {
  if (!validation) {
    return true;
  }

  const result = await Validation.metaInterpret(meta, doc, memo);
  return Validation.isValid(result);
};

module.exports = { type, compile, interpret };
