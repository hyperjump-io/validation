const JVal = require("../..");


const type = "array";
const compile = async (doc) => JVal.value(doc);
const interpret = (minItems, value) => value.length >= minItems;

module.exports = { type, compile, interpret };
