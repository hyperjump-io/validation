const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret =  (exclusiveMaximum, value) => value < exclusiveMaximum;

module.exports = { type, compile, interpret };
