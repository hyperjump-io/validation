const Hyperjump = require("@hyperjump/browser");
const jsonStringify = require("fastest-stable-stringify");


const compile = async (doc) => jsonStringify(Hyperjump.value(doc));
const interpret = (constValue, doc) => jsonStringify(Hyperjump.value(doc)) === constValue;

module.exports = { compile, interpret };
