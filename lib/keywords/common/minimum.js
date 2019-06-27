const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret =  (minimum, doc) => Hyperjump.value(doc) >= minimum;

module.exports = { type, compile, interpret };
