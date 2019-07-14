const Hyperjump = require("@hyperjump/browser");


const type = "number";
const compile = async (doc) => Hyperjump.value(doc);
const interpret =  (exclusiveMaximum, doc) => Hyperjump.value(doc) < exclusiveMaximum;

module.exports = { type, compile, interpret };
