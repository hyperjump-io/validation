const type = "number";
const compile = (doc) => doc;
const interpret = async (exclusiveMaximum, doc) => await doc < exclusiveMaximum;

module.exports = { type, compile, interpret };
