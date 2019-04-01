const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret =  (minimum, value) => value >= minimum;

module.exports = { type, compile, interpret };
