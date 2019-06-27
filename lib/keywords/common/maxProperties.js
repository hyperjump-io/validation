const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");


const type = "object";
const compile = async (doc) => JVal.value(doc);
const interpret = (maxProperties, doc) => Object.keys(Hyperjump.value(doc)).length <= maxProperties;

module.exports = { type, compile, interpret };
