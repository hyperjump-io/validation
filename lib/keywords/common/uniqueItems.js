const jsonStringify = require("fastest-stable-stringify");
const JsonValidation = require("../../json-validation");


const type = "array";

const compile = async (doc) => JsonValidation.value(doc);

const interpret = (uniqueItems, value) => {
  if (uniqueItems === false) {
    return true;
  }

  const normalizedItems = value.map(jsonStringify);
  return (new Set(normalizedItems)).size === normalizedItems.length;
};

module.exports = { type, compile, interpret };
