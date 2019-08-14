const Pact = require("@hyperjump/pact");


const type = "object";
const compile = async (doc) => Pact.all(await doc);
const interpret = (required, doc) => {
  return Pact.every(async (propertyName) => propertyName in await doc, required);
};

module.exports = { type, compile, interpret };
