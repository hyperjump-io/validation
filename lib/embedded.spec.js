const { expect } = require("chai");
const { loadDoc, testDomain } = require("./test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require(".");


describe("JSON Validation", () => {
  before(async () => {
    loadDoc("/folder/folder-number", {
      "$meta": { "$href": "http://validation.hyperjump.io/common" },
      "type": "number"
    });

    loadDoc("/folder/index", {
      "$meta": { "$href": "http://validation.hyperjump.io/common" },
      "type": "array",
      "items": { "$href": "folder-number" }
    });
  });

  describe("base URI change", () => {
    let validate;

    before(async () => {
      const url = "/base-uri-change";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "array",
        "items": {
          "$embedded": testDomain + "/folder/index",
          "$meta": { "$href": "http://validation.hyperjump.io/common" },
          "type": "array",
          "items": { "$href": "folder-number" }
        }
      });

      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("base URI change href invalid", async () => {
      const result = await validate([[1]]);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("base URI change - change folder", async () => {
      const result = await validate([["a"]]);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("base URI change - change folder", () => {
    let validate;

    before(async () => {

      const url = "/base-uri-change-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "list": { "$href": "#/definitions/baz" }
        },
        "definitions": {
          "baz": {
            "$embedded": testDomain + "/folder/index",
            "$meta": { "$href": "http://validation.hyperjump.io/common" },
            "type": "array",
            "items": { "$href": "folder-number" }
          }
        }
      });

      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("number is valid", async () => {
      const result = await validate({ "list": [1] });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("string is invalid", async () => {
      const result = await validate({ "list": ["a"] });
      expect(HVal.isValid(result)).to.eql(false);
    });
  });
});
