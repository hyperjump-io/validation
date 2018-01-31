const JsonPointer = require("./json-pointer");


const construct = (url, content) => Object.freeze({ url, content });

const JsonReference = (url, content) => construct(url, JSON.parse(content));

JsonReference.value = (doc) => {
  const pointer = doc.url.split("#", 2)[1];
  return JsonPointer.get(doc.content, pointer);
};

JsonReference.get = (doc, url) => {
  // Assumes id is always ""
  const result = construct(url, doc.content);
  const value = JsonReference.value(result);
  return value["$ref"] ? JsonReference.get(result, value["$ref"]) : result;
};

module.exports = JsonReference
