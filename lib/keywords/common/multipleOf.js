const { numberEqual } = require("../../common");


const type = "number";

const compile = (doc) => doc;

const interpret = async (multipleOf, doc) => {
  const remainder = (await doc) % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

module.exports = { type, compile, interpret };
