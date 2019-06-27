const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "array";
const compile = async (doc) => JVal.value(doc);
const interpret = (minItems, doc) => Hyperjump.value(doc).length >= minItems;

module.exports = { type, compile, interpret };
