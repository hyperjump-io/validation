const JsonValidation = require("../../json-validation");


const type = "object";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (minProperties, value) => Object.keys(value).length >= minProperties;

module.exports = { type, compile, interpret };
