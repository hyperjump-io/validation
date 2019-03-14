const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid pattern value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-pattern-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "pattern": 4
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/pattern", false]]);
    });
  });

  describe("pattern validation", () => {
    let validate;

    before(async () => {
      const url = "/pattern-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "pattern": "^a*$"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("a matching pattern is valid", () => {
      const result = validate("aaa");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a non-matching pattern is invalid", () => {
      const result = validate("abc");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("pattern is not anchored", () => {
    let validate;

    before(async () => {
      const url = "/pattern-is-not-anchored";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "pattern": "a+"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("matches a substring", () => {
      const result = validate("xxaayy");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
