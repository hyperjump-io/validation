const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "object";
const compile = async (doc) => JVal.value(doc);
const interpret = (minProperties, doc) => Object.keys(Hyperjump.value(doc)).length >= minProperties;

module.exports = { type, compile, interpret };
