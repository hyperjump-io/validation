const JsonValidation = require("../../json-validation");


const type = "array";
const compile = async (doc) => JsonValidation.value(doc);
const interpret = (maxItems, value) => value.length <= maxItems;

module.exports = { type, compile, interpret };
