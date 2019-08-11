const type = "array";
const compile = (doc) => doc;
const interpret = async (minItems, doc) => (await doc).length >= minItems;

module.exports = { type, compile, interpret };
