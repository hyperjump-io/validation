const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const type = "object";

const compile = async (doc, ast) => Hyperjump.pipeline([
  Hyperjump.entries,
  Hyperjump.map(async ([propertyPattern, propertyDoc]) => {
    await HVal.compile(propertyDoc, ast);
    return [new RegExp(propertyPattern), propertyDoc.url];
  })
], doc);

const interpret = (patternProperties, doc, ast, memo) => {
  return Hyperjump.every(([pattern, property]) => {
    return Hyperjump.pipeline([
      Hyperjump.entries,
      Hyperjump.filter(([propertyName]) => pattern.test(propertyName)),
      Hyperjump.every(async ([, propertyValue]) => {
        const result = await HVal.interpret(ast, property, memo)(propertyValue);
        return HVal.isValid(result);
      })
    ], doc);
  }, patternProperties);
};

module.exports = { type, compile, interpret };
