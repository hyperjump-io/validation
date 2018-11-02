import jsonStringify from "json-stable-stringify";
import { TextEncoder } from "text-encoding";
import * as JsonPointer from "@hyperjump/json-pointer";
import * as JsonReference from "@hyperjump/json-reference";
import * as ValidationResult from "~/validation-result";


export const nil = JsonReference.nil;
export const value = JsonReference.value;
export const pointer = JsonReference.pointer;
export const get = JsonReference.get;
export const map = JsonReference.map;
export const entries = JsonReference.entries;

export const validate = async (doc) => {
  const meta = await _metaCompile(doc);
  const result = _metaInterpret(meta, value(doc));

  if (!ValidationResult.isValid(result)) {
    throw result;
  }

  const memo = await _compile(doc, {});
  return _interpret(memo, doc.url);
};

const _compile = async (doc, memo) => {
  if (memo[doc.url] === undefined) {
    memo[doc.url] = false;

    const $meta = await get("#/$meta", doc);
    const meta = value($meta) || {};

    memo[doc.url] = await entries(doc)
      .filter(([keyword, _]) => keyword !== "$meta")
      .map(async ([keyword, keywordDoc]) => {
        if (!(keyword in meta)) {
          throw Error(`Encountered undeclared keyword '${keyword}' at '${keywordDoc.url}'`);
        }

        const keywordUrl = meta[keyword];
        const node = await keywords[keywordUrl].compile(keywordDoc, memo);

        return [keywordUrl, keywordDoc.url, node];
      });
  }

  return memo;
};

const metaMemo = {};
const _metaCompile = async (doc) => {
  const $meta = await get("#/$meta", doc);
  const meta = value($meta) || {};

  await Promise.all(Object.entries(meta)
    .filter(([keyword, keywordUrl]) => keyword[0] !== "$" && !(keywordUrl in metaMemo))
    .map(async ([keyword, _]) => {
      const keywordUrl = meta[keyword];
      const metaDoc = { url: keywordUrl, content: keywords[keywordUrl].validation };
      return await _compile(metaDoc, metaMemo);
    }));

  return meta;
};

const _interpret = (memo, url) => (value) => {
  return memo[url].map(([keywordUrl, ptr, keywordValue]) => {
    return [ptr, keywords[keywordUrl].interpret(keywordValue, value, memo)];
  });
};

const _metaInterpret = (meta, value) => {
  return Object.keys(value)
    .filter((keyword) => keyword in meta)
    .map((keyword) => {
      const keywordUrl = meta[keyword];
      const result = _interpret(metaMemo, keywordUrl)(value[keyword]);
      return [JsonPointer.cons(JsonPointer.nil, keyword), ValidationResult.isValid(result)];
    });
};

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

const multipleOf = (multipleOf, value) => {
  const remainder = value % multipleOf;
  return numberEqual(0, remainder) || numberEqual(multipleOf, remainder);
};

const jsonStringLength = (string) => (new TextEncoder("utf-8").encode(string)).length;

const keywords = {};

export const addKeyword = (url, keywordDefinition) => keywords[url] = keywordDefinition;

addKeyword("http://validation.hyperjump.io/common/const", {
  validation: {},
  compile: async (doc) => jsonStringify(value(doc)),
  interpret: (constValue, value) => jsonStringify(value) === constValue
});

addKeyword("http://validation.hyperjump.io/common/type", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "anyOf": [
      { "const": "null" },
      { "const": "boolean" },
      { "const": "object" },
      { "const": "array" },
      { "const": "number" },
      { "const": "string" }
    ]
  },
  compile: async (doc) => value(doc),
  interpret: (type, value) => isType[type](value)
});

addKeyword("http://validation.hyperjump.io/common/multipleOf", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret: (multipleOfValue, value) => {
    return typeof value !== "number" || multipleOf(multipleOfValue, value);
  }
});

addKeyword("http://validation.hyperjump.io/common/maximum", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret:  (maximum, value) => typeof value !== "number" || value <= maximum
});

addKeyword("http://validation.hyperjump.io/common/exclusiveMaximum", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret:  (exclusiveMaximum, value) => typeof value !== "number" || value < exclusiveMaximum
});

addKeyword("http://validation.hyperjump.io/common/minimum", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret:  (minimum, value) => typeof value !== "number" || value >= minimum
});

addKeyword("http://validation.hyperjump.io/common/exclusiveMinimum", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret:  (exclusiveMinimum, value) => typeof value !== "number" || value > exclusiveMinimum
});

addKeyword("http://validation.hyperjump.io/common/maxLength", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret: (maxLength, value) => typeof value !== "string" || jsonStringLength(value) <= maxLength
});

addKeyword("http://validation.hyperjump.io/common/minLength", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number"
  },
  compile: async (doc) => value(doc),
  interpret: (minLength, value) => typeof value !== "string" || jsonStringLength(value) >= minLength
});

addKeyword("http://validation.hyperjump.io/common/pattern", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "string"
  },
  compile: async (doc) => new RegExp(value(doc)),
  interpret: (pattern, value) => typeof value !== "string" || pattern.test(value)
});

addKeyword("http://validation.hyperjump.io/common/items", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "object",
    "validation": true
  },
  compile: async (doc, memo) => {
    await _compile(doc, memo);
    return doc.url;
  },
  interpret: (items, value, memo) => !Array.isArray(value) || value.every((item) => {
    const result = _interpret(memo, items)(item);
    return ValidationResult.isValid(result);
  })
});

addKeyword("http://validation.hyperjump.io/common/tupleItems", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "array",
    "items": {
      "type": "object",
      "validation": true
    }
  },
  compile: async (doc, memo) => await map(async (itemDoc) => {
    await _compile(itemDoc, memo);
    return itemDoc.url;
  }, doc),
  interpret: (tupleItems, value, memo) => !Array.isArray(value) || value.every((item, ndx) => {
    if (!(ndx in tupleItems)) {
      return true;
    }

    const result = _interpret(memo, tupleItems[ndx])(item);
    return ValidationResult.isValid(result);
  })
});

addKeyword("http://validation.hyperjump.io/common/maxItems", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number",
    "minimum": 0,
    "multipleOf": 1
  },
  compile: async (doc) => value(doc),
  interpret: (maxItems, value) => !Array.isArray(value) || value.length <= maxItems
});

addKeyword("http://validation.hyperjump.io/common/minItems", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number",
    "minimum": 0,
    "multipleOf": 1
  },
  compile: async (doc) => value(doc),
  interpret: (minItems, value) => !Array.isArray(value) || value.length >= minItems
});

addKeyword("http://validation.hyperjump.io/common/uniqueItems", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "boolean"
  },
  compile: async (doc) => value(doc),
  interpret: (uniqueItems, value) => {
    if (!Array.isArray(value) || uniqueItems === false) {
      return true;
    }

    const normalizedItems = value.map(jsonStringify);
    return (new Set(normalizedItems)).size === normalizedItems.length;
  }
});

addKeyword("http://validation.hyperjump.io/common/properties", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "object",
    "patternProperties": {
      "": {
        "type": "object",
        "validation": true
      }
    }
  },
  compile: async (doc, memo) => await entries(doc)
    .reduce(async (acc, [propertyName, propertyDoc]) => {
      await _compile(propertyDoc, memo);
      acc[propertyName] = propertyDoc.url;
      return acc;
    }, {}),
  interpret: (properties, value, memo) => {
    return !isObject(value) || Object.keys(value)
      .filter((propertyName) => propertyName in properties)
      .every((propertyName) => {
        const result = _interpret(memo, properties[propertyName])(value[propertyName]);
        return ValidationResult.isValid(result);
      });
  }
});

addKeyword("http://validation.hyperjump.io/common/patternProperties", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "object",
    "patternProperties": {
      "": {
        "type": "object",
        "validation": true
      }
    }
  },
  compile: async (doc, memo) => await entries(doc)
    .map(async ([propertyPattern, propertyDoc]) => {
      await _compile(propertyDoc, memo);
      return [new RegExp(propertyPattern), propertyDoc.url];
    }),
  interpret: (patternProperties, value, memo) => !isObject(value) || patternProperties
    .every(([pattern, property]) => Object.keys(value)
      .filter((propertyName) => pattern.test(propertyName))
      .every((propertyName) => {
        const result = _interpret(memo, property)(value[propertyName]);
        return ValidationResult.isValid(result);
      }))
});

addKeyword("http://validation.hyperjump.io/common/propertyNames", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "object",
    "validation": true
  },
  compile: async (doc, memo) => {
    await _compile(doc, memo);
    return doc.url;
  },
  interpret: (propertyNames, value, memo) => !isObject(value) || Object.keys(value)
    .every((name) => {
      const result = _interpret(memo, propertyNames)(name);
      return ValidationResult.isValid(result);
    })
});

addKeyword("http://validation.hyperjump.io/common/maxProperties", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number",
    "minimum": 0,
    "multipleOf": 1
  },
  compile: async (doc) => value(doc),
  interpret: (maxProperties, value) => !isObject(value) || Object.keys(value).length <= maxProperties
});

addKeyword("http://validation.hyperjump.io/common/minProperties", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "number",
    "minimum": 0,
    "multipleOf": 1
  },
  compile: async (doc) => value(doc),
  interpret: (minProperties, value) => !isObject(value) || Object.keys(value).length >= minProperties
});

addKeyword("http://validation.hyperjump.io/common/required", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "array",
    "items": {
      "type": "string"
    }
  },
  compile: async (doc) => value(doc),
  interpret: (required, value) => !isObject(value) || required.every((propertyName) => propertyName in value)
});

addKeyword("http://validation.hyperjump.io/common/allOf", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "array",
    "items": {
      "type": "object",
      "validation": true
    }
  },
  compile: async (doc, memo) => await map(async (subDoc) => {
    await _compile(subDoc, memo);
    return subDoc.url;
  }, doc),
  interpret: (allOf, value, memo) => allOf.every((subDoc) => {
    const result = _interpret(memo, subDoc)(value);
    return ValidationResult.isValid(result);
  })
});

addKeyword("http://validation.hyperjump.io/common/anyOf", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "array",
    "items": {
      "type": "object",
      "validation": true
    }
  },
  compile: async (doc, memo) => await map(async (subDoc) => {
    await _compile(subDoc, memo);
    return subDoc.url;
  }, doc),
  interpret: (anyOf, value, memo) => {
    return anyOf.some((url) => {
      const result = _interpret(memo, url)(value);
      return ValidationResult.isValid(result);
    });
  }
});

addKeyword("http://validation.hyperjump.io/common/oneOf", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "array",
    "items": {
      "type": "object",
      "validation": true
    }
  },
  compile: async (doc, memo) => await map(async (subDoc) => {
    await _compile(subDoc, memo);
    return subDoc.url;
  }, doc),
  interpret: (oneOf, value, memo) => oneOf.reduce((acc, subDoc) => {
    const result = _interpret(memo, subDoc)(value);
    const isValid = ValidationResult.isValid(result);
    return acc ? !isValid : isValid;
  }, false)
});

addKeyword("http://validation.hyperjump.io/common/not", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "object",
    "validation": true
  },
  compile: async (doc, memo) => {
    await _compile(doc, memo);
    return doc.url;
  },
  interpret: (not, value, memo) => {
    const result = _interpret(memo, not)(value);
    return !ValidationResult.isValid(result);
  }
});

addKeyword("http://validation.hyperjump.io/common/definitions", {
  validation: {
    "$meta": { "$ref": "http://validation.hyperjump.io/common" },
    "type": "object",
    "patternProperties": {
      "": {
        "type": "object",
        "validation": true
      }
    }
  },
  compile: async () => undefined,
  interpret: () => true
});

addKeyword("http://validation.hyperjump.io/common/validation", {
  validation: {},
  compile: async (doc) => {
    const meta = await _metaCompile(doc);
    return [value(doc), meta];
  },
  interpret: ([validation, meta], value) => {
    if (!isObject(value) || !validation) {
      return true;
    }

    const result = _metaInterpret(meta, value);
    return ValidationResult.isValid(result);
  }
});
