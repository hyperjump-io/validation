const type = "object";
const compile = (doc) => doc;
const interpret = async (minProperties, doc) => Object.keys(await doc).length >= minProperties;

module.exports = { type, compile, interpret };
