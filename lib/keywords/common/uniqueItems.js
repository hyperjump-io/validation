const Pact = require("@hyperjump/pact");
const jsonStringify = require("fastest-stable-stringify");


const type = "array";

const compile = (doc) => doc;

const interpret = async (uniqueItems, doc) => {
  if (uniqueItems === false) {
    return true;
  }

  const normalizedItems = await Pact.map(jsonStringify, doc);
  return (new Set(normalizedItems)).size === normalizedItems.length;
};

module.exports = { type, compile, interpret };
