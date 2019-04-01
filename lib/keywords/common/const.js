const jsonStringify = require("fastest-stable-stringify");
const JVal = require("../..");


const compile = async (doc) => jsonStringify(JVal.value(doc));
const interpret = (constValue, value) => jsonStringify(value) === constValue;

module.exports = { compile, interpret };
