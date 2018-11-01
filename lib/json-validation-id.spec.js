import { expect } from "chai";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Validation", () => {
  before(async () => {
    loadDoc("/folder/folder-number", {
      "$meta": { "$ref": "http://validation.hyperjump.io/common" },
      "type": "number"
    });

    loadDoc("/folder/index", {
      "$meta": { "$ref": "http://validation.hyperjump.io/common" },
      "type": "array",
      "items": { "$ref": "folder-number" }
    });
  });

  describe("base URI change", () => {
    let validate;

    before(async () => {
      const url = "/base-uri-change";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "items": {
          "$id": testDomain + "/folder/index",
          "$meta": { "$ref": "http://validation.hyperjump.io/common" },
          "type": "array",
          "items": { "$ref": "folder-number" }
        }
      });

      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("base URI change ref invalid", () => {
      const result = validate([[1]]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("base URI change - change folder", () => {
      const result = validate([["a"]]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("base URI change - change folder", () => {
    let validate;

    before(async () => {

      const url = "/base-uri-change-2";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "list": { "$ref": "#/definitions/baz" }
        },
        "definitions": {
          "baz": {
            "$id": testDomain + "/folder/index",
            "$meta": { "$ref": "http://validation.hyperjump.io/common" },
            "type": "array",
            "items": { "$ref": "folder-number" }
          }
        }
      });

      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("number is valid", () => {
      const result = validate({ "list": [1] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("string is invalid", () => {
      const result = validate({ "list": ["a"] });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
