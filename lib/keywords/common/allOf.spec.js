const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid allOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-allOf-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "allOf": {}
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/allOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-allOf-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "allOf": [{}, "foo"]
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/allOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-allOf";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "allOf": [{ "type": "foo" }]
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/allOf", false]]);
    });
  });

  describe("allOf", () => {
    let validate;

    before(async () => {
      const url = "/allOf";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "allOf": [
          {
            "properties": {
              "bar": { "type": "number" }
            },
            "required": ["bar"]
          },
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          }
        ]
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("allOf", async () => {
      const result = await validate({ "foo": "baz", "bar": 2 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("mismatch second", async () => {
      const result = await validate({ "foo": "baz" });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("mismatch first", async () => {
      const result = await validate({ "bar": "quux" });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("wrong type", async () => {
      const result = await validate({ "foo": "baz", "baz": "quux" });
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("allOf with base", () => {
    let validate;

    before(async () => {
      const url = "/allOf-with-base";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": { "bar": { "type": "number" } },
        "required": ["bar"],
        "allOf": [
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          },
          {
            "properties": {
              "baz": { "type": "null" }
            },
            "required": ["baz"]
          }
        ]
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("valid", async () => {
      const result = await validate({ "foo": "quux", "bar": 2, "baz": null });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("mismatch base", async () => {
      const result = await validate({ "foo": "quux", "baz": null });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("mismatch first allOf", async () => {
      const result = await validate({ "bar": 2, "baz": null });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("mismatch second allOf", async () => {
      const result = await validate({ "foo": "quux", "bar": 2 });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("mismatch both", async () => {
      const result = await validate({ "bar": 2 });
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("allOf simple types", () => {
    let validate;

    before(async () => {
      const url = "/allOf-simple-types";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "allOf": [
          { "maximum": 30 },
          { "minimum": 20 }
        ]
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("valid", async () => {
      const result = await validate(25);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("mismatch one", async () => {
      const result = await validate(35);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });
});
