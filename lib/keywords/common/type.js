const Hyperjump = require("@hyperjump/browser");
const { isType } = require("../../common");


const compile = async (doc) => Hyperjump.value(doc);
const interpret = (type, doc) => isType[type](Hyperjump.value(doc));

module.exports = { compile, interpret };
