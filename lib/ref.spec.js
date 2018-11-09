import { expect } from "chai";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Validation", () => {
  describe("root pointer ref", () => {
    let validate;

    before(async () => {
      const url = "/root-pointer-ref";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "$ref": "#" },
          "bar": { "type": "number" }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("match", () => {
      const result = validate({ "foo": false });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("recursive match", () => {
      const result = validate({ "foo": { "foo": false } });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch", () => {
      const result = validate({ "bar": false });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("recursive match", () => {
      const result = validate({ "foo": { "bar": false } });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("relative pointer ref to object", () => {
    let validate;

    before(async () => {
      const url = "/relative-pointer-ref-to-object";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "number" },
          "bar": { "$ref": "#/properties/foo" }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("match", () => {
      const result = validate({ "bar": 3 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch", () => {
      const result = validate({ "bar": true });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("relative pointer ref to array", () => {
    let validate;

    before(async () => {
      const url = "/relative-pointer-ref-to-array";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "number" },
          { "$ref": "#/tupleItems/0" }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("match array", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch array", () => {
      const result = validate([1, "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("escaped pointer ref", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-ref";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "tilda": { "$ref": "#/definitions/tilda~0field" },
          "slash": { "$ref": "#/definitions/slash~1field" },
          "percent": { "$ref": "#/definitions/percent%25field" }
        },
        "definitions": {
          "tilda~field": { "type": "number" },
          "slash/field": { "type": "number" },
          "percent%field": { "type": "number" }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("slash invalid", () => {
      const result = validate({ "slash": "aoeu" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("tilda invalid", () => {
      const result = validate({ "tilda": "aoeu" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("percent invalid", () => {
      const result = validate({ "percent": "aoeu" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("slash valid", () => {
      const result = validate({ "slash": 123 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("tilda valid", () => {
      const result = validate({ "tilda": 123 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("percent valid", () => {
      const result = validate({ "percent": 123 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("nested refs", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-ref-2";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "definitions": {
          "a": { "type": "number" },
          "b": { "$ref": "#/definitions/a" },
          "c": { "$ref": "#/definitions/b" }
        },
        "$ref": "#/definitions/c"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("nested ref valid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("nested ref invalid", () => {
      const result = validate("a");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("nested refs", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-ref-3";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "definitions": {
          "reffed": { "type": "array" }
        },
        "properties": {
          "foo": {
            "$ref": "#/definitions/reffed",
            "maxItems": 2
          }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("ref valid", () => {
      const result = validate({ "foo": [] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ref valid, maxItems ignored", () => {
      const result = validate({ "foo": [1, 2, 3] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ref invalid", () => {
      const result = validate({ "foo": "string" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("Recursive references between docs", () => {
    let validate;

    before(async () => {
      loadDoc("/tree", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "meta": { "type": "string" },
          "nodes": {
            "type": "array",
            "items": { "$ref": "node" }
          }
        },
        "required": ["meta", "nodes"]
      });
      loadDoc("/node", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "value": { "type": "number" },
          "subtree": { "$ref": "tree" }
        },
        "required": ["value"]
      });
      const doc = await JsonValidation.get(testDomain + "/tree");
      validate = await JsonValidation.validate(doc);
    });

    it("valid tree", () => {
      const result = validate({
        "meta": "root",
        "nodes": [
          {
            "value": 1,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": 1.1 },
                { "value": 1.2 }
              ]
            }
          },
          {
            "value": 2,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": 2.1 },
                { "value": 2.2 }
              ]
            }
          }
        ]
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("invalid tree", () => {
      const result = validate({
        "meta": "root",
        "nodes": [
          {
            "value": 1,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": "string is invalid" },
                { "value": 1.2 }
              ]
            }
          },
          {
            "value": 2,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": 2.1 },
                { "value": 2.2 }
              ]
            }
          }
        ]
      });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
