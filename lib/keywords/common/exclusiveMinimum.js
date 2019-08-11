const type = "number";
const compile = (doc) => doc;
const interpret = async (exclusiveMinimum, doc) => await doc > exclusiveMinimum;

module.exports = { type, compile, interpret };
