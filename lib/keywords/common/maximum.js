const type = "number";
const compile = (doc) => doc;
const interpret = async (maximum, doc) => await doc <= maximum;

module.exports = { type, compile, interpret };
