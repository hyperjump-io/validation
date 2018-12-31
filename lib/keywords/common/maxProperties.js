const JsonValidation = require("../../json-validation");


const type = "object";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (maxProperties, value) => Object.keys(value).length <= maxProperties;

module.exports = { type, compile, interpret };
