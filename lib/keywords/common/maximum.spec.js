const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid maximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maximum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maximum": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/maximum", false]]);
    });
  });

  describe("maximum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/maximum-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maximum": 3.0
      });
      const doc = await JVal.get(testDomain + "/maximum-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("below the maximum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("above the maximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
