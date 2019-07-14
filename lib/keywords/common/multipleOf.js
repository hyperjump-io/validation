const Hyperjump = require("@hyperjump/browser");
const { numberEqual } = require("../../common");


const type = "number";

const compile = async (doc) => Hyperjump.value(doc);

const interpret = (multipleOf, doc) => {
  const remainder = Hyperjump.value(doc) % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

module.exports = { type, compile, interpret };
