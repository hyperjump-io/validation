const Hyperjump = require("@hyperjump/browser");
const Validation = require("../../core");


const type = "object";

const compile = async (doc, ast) => Hyperjump.pipeline([
  Hyperjump.entries,
  Hyperjump.map(async ([propertyPattern, propertyDoc]) => {
    await Validation.compile(propertyDoc, ast);
    return [new RegExp(propertyPattern), await propertyDoc.$url];
  }),
  Hyperjump.all
], doc);

const interpret = (patternProperties, doc, ast, memo) => {
  return Hyperjump.every(([pattern, property]) => {
    return Hyperjump.pipeline([
      Hyperjump.entries,
      Hyperjump.filter(([propertyName]) => pattern.test(propertyName)),
      Hyperjump.every(async ([, propertyValue]) => {
        const result = await Validation.interpret(ast, property)(propertyValue, memo);
        return Validation.isValid(result);
      })
    ], doc);
  }, patternProperties);
};

module.exports = { type, compile, interpret };
