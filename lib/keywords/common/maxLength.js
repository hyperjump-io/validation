const { jsonStringLength } = require("../../common");


const type = "string";
const compile = (doc) => doc;
const interpret = async (maxLength, doc) => jsonStringLength(await doc) <= maxLength;

module.exports = { type, compile, interpret };
