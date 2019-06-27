const Hyperjump = require("@hyperjump/browser");
const jsonStringify = require("fastest-stable-stringify");
const JVal = require("../..");


const compile = async (doc) => jsonStringify(JVal.value(doc));
const interpret = (constValue, doc) => jsonStringify(Hyperjump.value(doc)) === constValue;

module.exports = { compile, interpret };
