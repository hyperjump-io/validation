const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret =  (exclusiveMaximum, doc) => Hyperjump.value(doc) < exclusiveMaximum;

module.exports = { type, compile, interpret };
