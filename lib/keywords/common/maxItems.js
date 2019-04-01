const JVal = require("../..");


const type = "array";
const compile = async (doc) => JVal.value(doc);
const interpret = (maxItems, value) => value.length <= maxItems;

module.exports = { type, compile, interpret };
