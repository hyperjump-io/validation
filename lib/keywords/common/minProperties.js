const JVal = require("../..");


const type = "object";
const compile = async (doc) => JVal.value(doc);
const interpret = (minProperties, value) => Object.keys(value).length >= minProperties;

module.exports = { type, compile, interpret };
