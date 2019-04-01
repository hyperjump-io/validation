const JVal = require("../..");


const type = "number";
const compile = async (doc) => JVal.value(doc);
const interpret =  (maximum, value) => value <= maximum;

module.exports = { type, compile, interpret };
