const JsonValidation = require("../../json-validation");
const { numberEqual } = require("../../common");


const type = "number";

const compile = async (doc) => JsonValidation.value(doc);

const interpret = (multipleOf, value) => {
  const remainder = value % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

module.exports = { type, compile, interpret };
