const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const compile = async (doc, ast) => await Hyperjump.map(async (subDoc) => {
  await HVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (anyOf, doc, ast, memo) => {
  return Hyperjump.some(async (url) => {
    const result = await HVal.interpret(ast, url)(doc, memo);
    return HVal.isValid(result);
  }, anyOf);
};

module.exports = { compile, interpret };
