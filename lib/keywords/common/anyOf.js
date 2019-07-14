const Hyperjump = require("@hyperjump/browser");
const JVal = require("../../core");
const ValidationResult = require("../../validation-result");


const compile = async (doc, ast) => await Hyperjump.map(async (subDoc) => {
  await JVal.compile(subDoc, ast);
  return subDoc.url;
}, doc);

const interpret = (anyOf, doc, ast, memo) => {
  return Hyperjump.some(async (url) => {
    const result = await JVal.interpret(ast, url, memo)(doc);
    return ValidationResult.isValid(result);
  }, anyOf);
};

module.exports = { compile, interpret };
