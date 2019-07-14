const Hyperjump = require("@hyperjump/browser");
const { jsonStringLength } = require("../../common");


const type = "string";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (maxLength, doc) => jsonStringLength(Hyperjump.value(doc)) <= maxLength;

module.exports = { type, compile, interpret };
