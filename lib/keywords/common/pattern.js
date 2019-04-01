const JVal = require("../..");


const type = "string";
const compile = async (doc) => new RegExp(JVal.value(doc));
const interpret = (pattern, value) => pattern.test(value);

module.exports = { type, compile, interpret };
