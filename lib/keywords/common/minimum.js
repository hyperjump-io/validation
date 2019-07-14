const Hyperjump = require("@hyperjump/browser");


const type = "number";
const compile = async (doc) => Hyperjump.value(doc);
const interpret =  (minimum, doc) => Hyperjump.value(doc) >= minimum;

module.exports = { type, compile, interpret };
