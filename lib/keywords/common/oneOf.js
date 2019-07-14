const Hyperjump = require("@hyperjump/browser");
const JVal = require("../../core");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await Hyperjump.map(async (subDoc) => {
  await JVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (oneOf, doc, ast, memo) => {
  return Hyperjump.reduce(async (acc, subDoc) => {
    const result = await JVal.interpret(ast, subDoc, memo)(doc);
    const isValid = ValidationResult.isValid(result);
    return acc ? !isValid : isValid;
  }, false, oneOf);
};

module.exports = { compile, interpret };
