const JVal = require("../..");


const type = "object";
const compile = async (doc) => JVal.value(doc);
const interpret = (required, value) => required.every((propertyName) => propertyName in value);

module.exports = { type, compile, interpret };
