const JsonValidation = require("../../json-validation");


const type = "string";
const compile = async (doc) => new RegExp(JsonValidation.value(doc));
const interpret = (pattern, value) => pattern.test(value);

module.exports = { type, compile, interpret };
