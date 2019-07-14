const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid tupleItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": {}
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword-2";
      loadDoc(url, { "tupleItems": [false] });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupelItems";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "foo" }
        ]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/tupleItems", true]]);
    });
  });

  describe("an array of `tupleItems`", () => {
    let validate;

    before(async () => {
      const url = "/an-array-of-tupleItems";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "number" },
          { "type": "string" }
        ]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("correct types", async () => {
      const result = await validate([1, "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("wrong types", async () => {
      const result = await validate(["foo", 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("incomplete array of items", async () => {
      const result = await validate([1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("array with additional items", async () => {
      const result = await validate([1, "foo", true]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("empty array", async () => {
      const result = await validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", async () => {
      const result = await validate({
        "0": "invalid",
        "1": "valid",
        "length": 2
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
