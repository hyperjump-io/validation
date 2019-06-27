const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid exclusiveMaximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-exclusiveMaximum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "exclusiveMaximum": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/exclusiveMaximum", false]]);
    });
  });

  describe("exclusiveMaximum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/exclusive-maximum-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "exclusiveMaximum": 3.0
      });
      const doc = await JVal.get(testDomain + "/exclusive-maximum-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("below the exclusiveMaximum is valid", async () => {
      const result = await validate(2.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", async () => {
      const result = await validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("above the exclusiveMaximum is invalid", async () => {
      const result = await validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
