const { expect } = require("chai");
const { loadDoc, testDomain } = require("./test-utils.spec");
const JVal = require(".");
const ValidationResult = require("./validation-result");


describe("JSON Validation", () => {
  describe("root pointer href", () => {
    let validate;

    before(async () => {
      const url = "/root-pointer-href";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "$href": "#" },
          "bar": { "type": "number" }
        }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
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

  describe("relative pointer href to object", () => {
    let validate;

    before(async () => {
      const url = "/relative-pointer-href-to-object";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "number" },
          "bar": { "$href": "#/properties/foo" }
        }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
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

  describe("relative pointer href to array", () => {
    let validate;

    before(async () => {
      const url = "/relative-pointer-href-to-array";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "number" },
          { "$href": "#/tupleItems/0" }
        ]
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
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

  describe("escaped pointer href", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-href";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "tilda": { "$href": "#/definitions/tilda~0field" },
          "slash": { "$href": "#/definitions/slash~1field" },
          "percent": { "$href": "#/definitions/percent%25field" }
        },
        "definitions": {
          "tilda~field": { "type": "number" },
          "slash/field": { "type": "number" },
          "percent%field": { "type": "number" }
        }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
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

  describe("nested hrefs", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-href-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": {
          "a": { "type": "number" },
          "b": { "$href": "#/definitions/a" },
          "c": { "$href": "#/definitions/b" }
        },
        "$href": "#/definitions/c"
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("nested href valid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("nested href invalid", () => {
      const result = validate("a");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("nested hrefs", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-href-3";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": {
          "reffed": { "type": "array" }
        },
        "properties": {
          "foo": {
            "$href": "#/definitions/reffed",
            "maxItems": 2
          }
        }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("href valid", () => {
      const result = validate({ "foo": [] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("href valid, maxItems ignored", () => {
      const result = validate({ "foo": [1, 2, 3] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("href invalid", () => {
      const result = validate({ "foo": "string" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("Recursive references between docs", () => {
    let validate;

    before(async () => {
      loadDoc("/tree", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "meta": { "type": "string" },
          "nodes": {
            "type": "array",
            "items": { "$href": "node" }
          }
        },
        "required": ["meta", "nodes"]
      });
      loadDoc("/node", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "object",
        "properties": {
          "value": { "type": "number" },
          "subtree": { "$href": "tree" }
        },
        "required": ["value"]
      });
      const doc = await JVal.get(testDomain + "/tree", JVal.nil);
      validate = await JVal.validate(doc);
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
