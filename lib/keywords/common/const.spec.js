const { expect } = require("chai");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


describe("Hyperjump Validation", () => {
  describe("const validation", () => {
    let validate;

    before(async () => {
      const url = "/const-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "const": 2
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("same value is valid", async () => {
      const result = await validate(2);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("another value is invalid", async () => {
      const result = await validate(5);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("another type is invalid", async () => {
      const result = await validate("a");
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("const with object", () => {
    let validate;

    before(async () => {
      const url = "/const-with-object";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "const": { "foo": "bar", "baz": "bax" }
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("same object is valid", async () => {
      const result = await validate({ "foo": "bar", "baz": "bax" });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("same object with different property order is valid", async () => {
      const result = await validate({ "baz": "bax", "foo": "bar" });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("another object is invalid", async () => {
      const result = await validate({ "foo": "bar" });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("another type is invalid", async () => {
      const result = await validate([1, 2]);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("const with array", () => {
    let validate;

    before(async () => {
      const url = "/const-with-array";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "const": [{ "foo": "bar" }]
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("same array is valid", async () => {
      const result = await validate([{ "foo": "bar" }]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("another array item is invalid", async () => {
      const result = await validate([2]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("array with additional items is invalid", async () => {
      const result = await validate([1, 2, 3]);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("const with null", () => {
    let validate;

    before(async () => {
      const url = "/const-with-null";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "const": null
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("null is valid", async () => {
      const result = await validate(null);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("not null is invalid", async () => {
      const result = await validate(0);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });
});
