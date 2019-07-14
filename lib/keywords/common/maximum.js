const Hyperjump = require("@hyperjump/browser");


const type = "number";
const compile = async (doc) => Hyperjump.value(doc);
const interpret =  (maximum, doc) => Hyperjump.value(doc) <= maximum;

module.exports = { type, compile, interpret };
