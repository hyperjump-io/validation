const { expect } = require("chai");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


describe("JSON Validation", () => {
  describe("const validation", () => {
    let validate;

    before(async () => {
      const url = "/const-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "const": 2
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("same value is valid", async () => {
      const result = await validate(2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another value is invalid", async () => {
      const result = await validate(5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("another type is invalid", async () => {
      const result = await validate("a");
      expect(ValidationResult.isValid(result)).to.eql(false);
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
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("same object is valid", async () => {
      const result = await validate({ "foo": "bar", "baz": "bax" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("same object with different property order is valid", async () => {
      const result = await validate({ "baz": "bax", "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another object is invalid", async () => {
      const result = await validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("another type is invalid", async () => {
      const result = await validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(false);
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
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("same array is valid", async () => {
      const result = await validate([{ "foo": "bar" }]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another array item is invalid", async () => {
      const result = await validate([2]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("array with additional items is invalid", async () => {
      const result = await validate([1, 2, 3]);
      expect(ValidationResult.isValid(result)).to.eql(false);
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
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("null is valid", async () => {
      const result = await validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("not null is invalid", async () => {
      const result = await validate(0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
