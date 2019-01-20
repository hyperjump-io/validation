const { encode } = require("iconv-lite");


const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;

const isType = {
  "null": (value) => value === null,
  "boolean": (value) => typeof value === "boolean",
  "object": isObject,
  "array": (value) => Array.isArray(value),
  "number": (value) => typeof value === "number",
  "string": (value) => typeof value === "string"
};

const numberEqual = (a, b) => {
  return Math.abs(a - b) < Number.EPSILON;
};

const jsonStringLength = (string) => encode(string, "utf-8").length;

module.exports = { isObject, isType, numberEqual, jsonStringLength };
