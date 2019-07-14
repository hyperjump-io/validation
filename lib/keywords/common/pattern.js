const Hyperjump = require("@hyperjump/browser");


const type = "string";
const compile = async (doc) => new RegExp(Hyperjump.value(doc));
const interpret = (pattern, doc) => pattern.test(Hyperjump.value(doc));

module.exports = { type, compile, interpret };
