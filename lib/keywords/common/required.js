const JsonValidation = require("../../json-validation");


const type = "object";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (required, value) => required.every((propertyName) => propertyName in value);

module.exports = { type, compile, interpret };
