const JsonValidation = require("../../json-validation");


const type = "number";
const compile = async (doc) => JsonValidation.value(doc);
const interpret =  (exclusiveMaximum, value) => value < exclusiveMaximum;

module.exports = { type, compile, interpret };
