const JVal = require("../..");
const { isType } = require("../../common");


const compile = async (doc) => JVal.value(doc);
const interpret = (type, value) => isType[type](value);

module.exports = { compile, interpret };
