const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const { jsonStringLength } = require("../../common");


const type = "string";
const compile = async (doc) => JVal.value(doc);
const interpret = (maxLength, doc) => jsonStringLength(Hyperjump.value(doc)) <= maxLength;

module.exports = { type, compile, interpret };
