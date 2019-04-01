const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid required value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-required-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "required": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/required", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-required-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "required": [3]
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });
  });

  describe("required validation", () => {
    let validate;

    before(async () => {
      loadDoc("/required-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {},
          "bar": {}
        },
        "required": ["foo"]
      });
      const doc = await JVal.get(testDomain + "/required-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("present required property is valid", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-present required property is invalid", () => {
      const result = validate({ "bar": 1 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores strings", () => {
      const result = validate("");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("required default validation", () => {
    let validate;

    before(async () => {
      loadDoc("/required-default-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {}
        }
      });
      const doc = await JVal.get(testDomain + "/required-default-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("not required by default", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("required with empty array", () => {
    let validate;

    before(async () => {
      loadDoc("/required-with-empty-array", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {}
        },
        "required": []
      });
      const doc = await JVal.get(testDomain + "/required-with-empty-array", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("property not required", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
