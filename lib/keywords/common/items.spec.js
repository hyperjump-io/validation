const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid items value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-items-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "items": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/items", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-items";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "items": {
          "type": "foo"
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/items", false]]);
    });
  });

  describe("a document given for items", () => {
    let validate;

    before(async () => {
      const url = "/a-document-given-for-items";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "items": { "type": "number" }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("valid items", () => {
      const result = validate([1, 2, 3]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("wrong type of items", () => {
      const result = validate([1, "x"]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", () => {
      const result = validate({
        "0": "invalid",
        "length": 1
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
