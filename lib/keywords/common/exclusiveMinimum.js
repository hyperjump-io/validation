const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret = (exclusiveMinimum, doc) => Hyperjump.value(doc) > exclusiveMinimum;

module.exports = { type, compile, interpret };
