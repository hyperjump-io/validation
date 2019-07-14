const Hyperjump = require("@hyperjump/browser");


const type = "object";
const compile = async (doc) => Hyperjump.value(doc);
const interpret = (required, doc) => required.every((propertyName) => propertyName in Hyperjump.value(doc));

module.exports = { type, compile, interpret };
