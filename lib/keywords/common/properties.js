const Pact = require("@hyperjump/pact");
const Validation = require("../../core");


const type = "object";

const compile = (doc, ast) => Pact.pipeline([
  Pact.entries,
  Pact.reduce(async (acc, [propertyName, propertyDoc]) => {
    await Validation.compile(propertyDoc, ast);
    acc[propertyName] = await propertyDoc.$url;
    return acc;
  }, {})
], doc);

const interpret = (properties, doc, ast, memo) => {
  return Pact.pipeline([
    Pact.entries,
    Pact.filter(([propertyName]) => propertyName in properties),
    Pact.every(async ([propertyName, propertyValue]) => {
      const result = await Validation.interpret(ast, properties[propertyName])(propertyValue, memo);
      return Validation.isValid(result);
    })
  ], doc);
};

module.exports = { type, compile, interpret };
