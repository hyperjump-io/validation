const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "object";
const compile = async (doc) => JVal.value(doc);
const interpret = (required, doc) => required.every((propertyName) => propertyName in Hyperjump.value(doc));

module.exports = { type, compile, interpret };
