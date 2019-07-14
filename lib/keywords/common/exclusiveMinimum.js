const Hyperjump = require("@hyperjump/browser");


const type = "number";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (exclusiveMinimum, doc) => Hyperjump.value(doc) > exclusiveMinimum;

module.exports = { type, compile, interpret };
