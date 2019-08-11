const type = "array";
const compile = (doc) => doc;
const interpret = async (maxItems, doc) => (await doc).length <= maxItems;

module.exports = { type, compile, interpret };
