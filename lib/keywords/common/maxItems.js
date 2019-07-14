const Hyperjump = require("@hyperjump/browser");


const type = "array";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (maxItems, doc) => Hyperjump.value(doc).length <= maxItems;

module.exports = { type, compile, interpret };
