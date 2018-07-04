import * as JsonPointer from "@hyperjump/json-pointer";


const construct = (url, content) => Object.freeze({ url, content });

// TODO: Resolve duplication with get
const JsonReference = (url, content) => {
  const result = construct(url, JSON.parse(content));
  const value = JsonReference.value(result);
  return value["$ref"] ? JsonReference.get(result, value["$ref"]) : result;
};

JsonReference.value = (doc) => {
  const pointer = JsonReference.pointer(doc);
  return JsonPointer.get(doc.content, pointer);
};

JsonReference.pointer = (doc) => {
  return decodeURIComponent(doc.url.split("#", 2)[1]);
};

// TODO: Handle remote references
JsonReference.get = (doc, url) => {
  // Assumes id is always ""
  const result = construct(url, doc.content);
  const value = JsonReference.value(result);
  return value["$ref"] ? JsonReference.get(result, value["$ref"]) : result;
};

export default JsonReference;
