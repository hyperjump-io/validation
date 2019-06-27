const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "string";
const compile = async (doc) => new RegExp(JVal.value(doc));
const interpret = (pattern, doc) => pattern.test(Hyperjump.value(doc));

module.exports = { type, compile, interpret };
