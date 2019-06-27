const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret =  (maximum, doc) => Hyperjump.value(doc) <= maximum;

module.exports = { type, compile, interpret };
