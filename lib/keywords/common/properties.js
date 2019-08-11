const Hyperjump = require("@hyperjump/browser");
const Validation = require("../../core");


const type = "object";

const compile = (doc, ast) => Hyperjump.pipeline([
  Hyperjump.entries,
  Hyperjump.reduce(async (acc, [propertyName, propertyDoc]) => {
    await Validation.compile(propertyDoc, ast);
    acc[propertyName] = await propertyDoc.$url;
    return acc;
  }, {})
], doc);

const interpret = (properties, doc, ast, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.filter(([propertyName]) => propertyName in properties),
    Hyperjump.every(async ([propertyName, propertyValue]) => {
      const result = await Validation.interpret(ast, properties[propertyName])(propertyValue, memo);
      return Validation.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
