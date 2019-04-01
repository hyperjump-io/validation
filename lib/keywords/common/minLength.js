const JVal = require("../..");
const { jsonStringLength } = require("../../common");


const type = "string";
const compile = async (doc) => JVal.value(doc);
const interpret = (minLength, value) => jsonStringLength(value) >= minLength;

module.exports = { type, compile, interpret };
