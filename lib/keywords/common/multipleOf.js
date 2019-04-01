const JVal = require("../..");
const { numberEqual } = require("../../common");


const type = "number";

const compile = async (doc) => JVal.value(doc);

const interpret = (multipleOf, value) => {
  const remainder = value % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

module.exports = { type, compile, interpret };
