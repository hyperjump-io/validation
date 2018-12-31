const JsonValidation = require("../../json-validation");
const { jsonStringLength } = require("../../json-validation-common");


const type = "string";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (maxLength, value) => jsonStringLength(value) <= maxLength;

module.exports = { type, compile, interpret };
