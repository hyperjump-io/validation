const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret = (exclusiveMinimum, value) => value > exclusiveMinimum;

module.exports = { type, compile, interpret };
