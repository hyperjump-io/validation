const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
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
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
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
      const doc = await JsonValidation.get(testDomain + "/exclusive-maximum-validation");
      validate = await JsonValidation.validate(doc);
    });

    it("below the exclusiveMaximum is valid", () => {
      const result = validate(2.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("above the exclusiveMaximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
