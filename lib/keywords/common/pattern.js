const type = "string";
const compile = async (doc) => new RegExp(await doc);
const interpret = async (pattern, doc) => pattern.test(await doc);

module.exports = { type, compile, interpret };
