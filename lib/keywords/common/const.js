const jsonStringify = require("fastest-stable-stringify");
const JsonValidation = require("../../json-validation");


const compile = async (doc) => jsonStringify(JsonValidation.value(doc));
const interpret = (constValue, value) => jsonStringify(value) === constValue;

module.exports = { compile, interpret };
