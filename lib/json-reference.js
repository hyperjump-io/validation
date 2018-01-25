const JsonPointer = require("./json-pointer");


const JsonReference = (url, content) => Object.freeze({ url, content });

JsonReference.value = (doc) => {
  const pointer = doc.url.split("#", 2)[1];
  return JsonPointer.get(pointer, doc.content);
};

JsonReference.get = (doc, url) => {
  // Assumes id is always ""
  const result = JsonReference(url, doc.content);
  const value = JsonReference.value(result);
  return value["$ref"] ? JsonReference.get(result, value["$ref"]) : result;
};

module.exports = JsonReference
