const Hyperjump = require("@hyperjump/browser");
const HVal = require("../../core");


const type = "object";

const compile = async (doc, ast) => await Hyperjump.pipeline([
  Hyperjump.entries,
  Hyperjump.reduce(async (acc, [propertyName, propertyDoc]) => {
    await HVal.compile(propertyDoc, ast);
    acc[propertyName] = propertyDoc.url;
    return acc;
  }, {})
], doc);

const interpret = (properties, doc, ast, memo) => {
  return Hyperjump.pipeline([
    Hyperjump.entries,
    Hyperjump.filter(([propertyName]) => propertyName in properties),
    Hyperjump.every(async ([propertyName, propertyValue]) => {
      const result = await HVal.interpret(ast, properties[propertyName])(propertyValue, memo);
      return HVal.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
