const JsonValidation = require("../../json-validation");


const type = "number";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (exclusiveMinimum, value) => value > exclusiveMinimum;

module.exports = { type, compile, interpret };
