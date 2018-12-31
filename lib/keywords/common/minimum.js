const JsonValidation = require("../../json-validation");


const type = "number";
const compile = async (doc) => JsonValidation.value(doc);
const interpret =  (minimum, value) => value >= minimum;

module.exports = { type, compile, interpret };
