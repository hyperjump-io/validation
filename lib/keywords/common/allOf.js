const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await JVal.map(async (subDoc) => {
  await JVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (allOf, doc, ast, memo) => {
  return Hyperjump.every(async (subDoc) => {
    const result = await JVal.interpret(ast, subDoc, memo)(doc);
    return ValidationResult.isValid(result);
  }, allOf);
};

module.exports = { compile, interpret };
