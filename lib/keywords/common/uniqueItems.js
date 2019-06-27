const Hyperjump = require("@hyperjump/browser");
const jsonStringify = require("fastest-stable-stringify");
const JVal = require("../..");


const type = "array";

const compile = async (doc) => JVal.value(doc);

const interpret = async (uniqueItems, doc) => {
  if (uniqueItems === false) {
    return true;
  }

  const normalizedItems = await Hyperjump.map(jsonStringify, doc);
  return (new Set(normalizedItems)).size === normalizedItems.length;
};

module.exports = { type, compile, interpret };
