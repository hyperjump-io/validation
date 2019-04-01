const JVal = require("../..");
const { jsonStringLength } = require("../../common");


const type = "string";
const compile = async (doc) => JVal.value(doc);
const interpret = (maxLength, value) => jsonStringLength(value) <= maxLength;

module.exports = { type, compile, interpret };
