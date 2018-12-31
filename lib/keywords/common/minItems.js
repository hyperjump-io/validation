const JsonValidation = require("../../json-validation");


const type = "array";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (minItems, value) => value.length >= minItems;

module.exports = { type, compile, interpret };
