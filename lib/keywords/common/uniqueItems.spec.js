const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid uniqueItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-uniqueItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "uniqueItems": "true"
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/uniqueItems", false]]);
    });
  });

  describe("uniqueItems validation", () => {
    let validate;

    before(async () => {
      const url = "/unique-items-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "uniqueItems": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("unique array of inteer is valid", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of numbers is invalid", () => {
      const result = validate([1, 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("numbers are unique if mathematically unequal", () => {
      const result = validate([1.0, 1.00, 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("unique array of objects is valid", () => {
      const result = validate([{ "foo": "bar" }, { "foo": "baz" }]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of objects is invalid", () => {
      const result = validate([{ "foo": "bar" }, { "foo": "bar" }]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("unique array of nested objects is valid", () => {
      const result = validate([
        { "foo": { "bar": { "baz": true } } },
        { "foo": { "bar": { "baz": false } } }
      ]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of nested objects is invalid", () => {
      const result = validate([
        { "foo": { "bar": { "baz": true } } },
        { "foo": { "bar": { "baz": true } } }
      ]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("unique array of arrays is valid", () => {
      const result = validate([["foo"], ["bar"]]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of arrays is invalid", () => {
      const result = validate([["foo"], ["foo"]]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("1 and true are unique", () => {
      const result = validate([1, true]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("0 and false are unique", () => {
      const result = validate([0, false]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("unique heterogneous types are valid", () => {
      const result = validate([{}, [1], true, null, 1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
