const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const { isType } = require("../../common");


const compile = async (doc) => JVal.value(doc);
const interpret = (type, doc) => isType[type](Hyperjump.value(doc));

module.exports = { compile, interpret };
