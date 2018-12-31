const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid validation value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-validation-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "validation": 4
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/validation", false]]);
    });
  });

  describe("validation validation", () => {
    let validate;

    before(async () => {
      const url = "/validation-validation";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "validation": true
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("value is a validation doc", () => {
      const result = validate({ "type": "object" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("value is an invalid validation doc", () => {
      const result = validate({ "type": "foo" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("value is not a validation doc", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
