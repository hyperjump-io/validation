const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid minItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minItems": "5"
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/minItems", false]]);
    });
  });

  describe("minItems validation", () => {
    let validate;

    before(async () => {
      const url = "/minItems-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minItems": 1
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("longer is valid", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate([1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too short is invalid", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
