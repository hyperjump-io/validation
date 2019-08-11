const type = "number";
const compile = (doc) => doc;
const interpret = async (minimum, doc) => (await doc) >= minimum;

module.exports = { type, compile, interpret };
