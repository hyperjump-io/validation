const JsonValidation = require("../../json-validation");


const type = "number";
const compile = async (doc) => JsonValidation.value(doc);
const interpret =  (maximum, value) => value <= maximum;

module.exports = { type, compile, interpret };
