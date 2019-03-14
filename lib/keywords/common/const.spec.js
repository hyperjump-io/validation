const { expect } = require("chai");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
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
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("same value is valid", () => {
      const result = validate(2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another value is invalid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("another type is invalid", () => {
      const result = validate("a");
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
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("same object is valid", () => {
      const result = validate({ "foo": "bar", "baz": "bax" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("same object with different property order is valid", () => {
      const result = validate({ "baz": "bax", "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another object is invalid", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("another type is invalid", () => {
      const result = validate([1, 2]);
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
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("same array is valid", () => {
      const result = validate([{ "foo": "bar" }]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another array item is invalid", () => {
      const result = validate([2]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("array with additional items is invalid", () => {
      const result = validate([1, 2, 3]);
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
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("null is valid", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("not null is invalid", () => {
      const result = validate(0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
