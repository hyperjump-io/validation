const JsonValidation = require("../../json-validation");
const { isType } = require("../../json-validation-common");


const compile = async (doc) => JsonValidation.value(doc);
const interpret = (type, value) => isType[type](value);

module.exports = { compile, interpret };
