const Hyperjump = require("@hyperjump/browser");


const type = "object";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (maxProperties, doc) => Object.keys(Hyperjump.value(doc)).length <= maxProperties;

module.exports = { type, compile, interpret };
