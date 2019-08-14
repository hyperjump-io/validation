const Pact = require("@hyperjump/pact");
const Validation = require("../../core");


const type = "object";

const compile = async (doc, ast) => Pact.pipeline([
  Pact.entries,
  Pact.map(async ([propertyPattern, propertyDoc]) => {
    await Validation.compile(propertyDoc, ast);
    return [new RegExp(propertyPattern), await propertyDoc.$url];
  }),
  Pact.all
], doc);

const interpret = (patternProperties, doc, ast, memo) => {
  return Pact.every(([pattern, property]) => {
    return Pact.pipeline([
      Pact.entries,
      Pact.filter(([propertyName]) => pattern.test(propertyName)),
      Pact.every(async ([, propertyValue]) => {
        const result = await Validation.interpret(ast, property)(propertyValue, memo);
        return Validation.isValid(result);
      })
    ], doc);
  }, patternProperties);
};

module.exports = { type, compile, interpret };
