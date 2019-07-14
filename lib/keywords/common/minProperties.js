const Hyperjump = require("@hyperjump/browser");


const type = "object";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (minProperties, doc) => Object.keys(Hyperjump.value(doc)).length >= minProperties;

module.exports = { type, compile, interpret };
