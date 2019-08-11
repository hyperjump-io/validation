const { expect } = require("chai");
const { loadDoc, testDomain } = require("./test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require(".");


describe("Hyperjump Validation", () => {
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("match", async () => {
      const result = await validate({ "foo": false });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("recursive match", async () => {
      const result = await validate({ "foo": { "foo": false } });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("mismatch", async () => {
      const result = await validate({ "bar": false });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("recursive match", async () => {
      const result = await validate({ "foo": { "bar": false } });
      expect(Validation.isValid(result)).to.eql(false);
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("match", async () => {
      const result = await validate({ "bar": 3 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("mismatch", async () => {
      const result = await validate({ "bar": true });
      expect(Validation.isValid(result)).to.eql(false);
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("match array", async () => {
      const result = await validate([1, 2]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("mismatch array", async () => {
      const result = await validate([1, "foo"]);
      expect(Validation.isValid(result)).to.eql(false);
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("slash invalid", async () => {
      const result = await validate({ "slash": "aoeu" });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("tilda invalid", async () => {
      const result = await validate({ "tilda": "aoeu" });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("percent invalid", async () => {
      const result = await validate({ "percent": "aoeu" });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("slash valid", async () => {
      const result = await validate({ "slash": 123 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("tilda valid", async () => {
      const result = await validate({ "tilda": 123 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("percent valid", async () => {
      const result = await validate({ "percent": 123 });
      expect(Validation.isValid(result)).to.eql(true);
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("nested href valid", async () => {
      const result = await validate(5);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("nested href invalid", async () => {
      const result = await validate("a");
      expect(Validation.isValid(result)).to.eql(false);
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("href valid", async () => {
      const result = await validate({ "foo": [] });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("href valid, maxItems ignored", async () => {
      const result = await validate({ "foo": [1, 2, 3] });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("href invalid", async () => {
      const result = await validate({ "foo": "string" });
      expect(Validation.isValid(result)).to.eql(false);
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
      const doc = Hyperjump.fetch(testDomain + "/tree");
      validate = await Validation.validate(doc);
    });

    it("valid tree", async () => {
      const result = await validate({
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
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("invalid tree", async () => {
      const result = await validate({
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
      expect(Validation.isValid(result)).to.eql(false);
    });
  });
});
