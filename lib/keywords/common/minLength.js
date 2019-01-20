const JsonValidation = require("../../json-validation");
const { jsonStringLength } = require("../../common");


const type = "string";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (minLength, value) => jsonStringLength(value) >= minLength;

module.exports = { type, compile, interpret };
