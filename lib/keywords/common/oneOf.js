const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const compile = async (doc, ast) => await Hyperjump.map(async (subDoc) => {
  await HVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (oneOf, doc, ast, memo) => {
  return Hyperjump.reduce(async (acc, subDoc) => {
    const result = await HVal.interpret(ast, subDoc)(doc, memo);
    const isValid = HVal.isValid(result);
    return acc ? !isValid : isValid;
  }, false, oneOf);
};

module.exports = { compile, interpret };
