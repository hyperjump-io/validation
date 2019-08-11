const type = "object";
const compile = (doc) => doc;
const interpret = async (maxProperties, doc) => Object.keys(await doc).length <= maxProperties;

module.exports = { type, compile, interpret };
