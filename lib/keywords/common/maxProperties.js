const JVal = require("../..");


const type = "object";
const compile = async (doc) => JVal.value(doc);
const interpret = (maxProperties, value) => Object.keys(value).length <= maxProperties;

module.exports = { type, compile, interpret };
