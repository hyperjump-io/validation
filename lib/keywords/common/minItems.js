const Hyperjump = require("@hyperjump/browser");


const type = "array";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (minItems, doc) => Hyperjump.value(doc).length >= minItems;

module.exports = { type, compile, interpret };
