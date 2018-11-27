import { encode } from "iconv-lite";


export const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;

export const isType = {
  "null": (value) => value === null,
  "boolean": (value) => typeof value === "boolean",
  "object": isObject,
  "array": (value) => Array.isArray(value),
  "number": (value) => typeof value === "number",
  "string": (value) => typeof value === "string"
};

export const numberEqual = (a, b) => {
  return Math.abs(a - b) < Number.EPSILON;
};

export const jsonStringLength = (string) => encode(string, "utf-8").length;
