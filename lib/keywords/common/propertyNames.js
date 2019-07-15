const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const type = "object";

const compile = async (doc, ast) => {
  await HVal.compile(doc, ast);
  return doc.url;
};

const interpret = (propertyNames, doc, ast, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.every(async ([name]) => {
      const result = await HVal.interpret(ast, propertyNames)(name, memo);
      return HVal.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
