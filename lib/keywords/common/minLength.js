const { jsonStringLength } = require("../../common");


const type = "string";
const compile = (doc) => doc;
const interpret = async (minLength, doc) => jsonStringLength(await doc) >= minLength;

module.exports = { type, compile, interpret };
