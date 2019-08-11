const Hyperjump = require("@hyperjump/browser");


const type = "object";
const compile = async (doc) => Hyperjump.all(await doc);
const interpret = (required, doc) => {
  return Hyperjump.every(async (propertyName) => propertyName in await doc, required);
};

module.exports = { type, compile, interpret };
