const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const compile = async (doc, ast) => await Hyperjump.map(async (subDoc) => {
  await HVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (allOf, doc, ast, memo) => {
  return Hyperjump.every(async (subDoc) => {
    const result = await HVal.interpret(ast, subDoc, memo)(doc);
    return HVal.isValid(result);
  }, allOf);
};

module.exports = { compile, interpret };
