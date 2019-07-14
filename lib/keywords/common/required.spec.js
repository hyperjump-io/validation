const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
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
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/required", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-required-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "required": [3]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

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
      const doc = await Hyperjump.get(testDomain + "/required-validation", Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("present required property is valid", async () => {
      const result = await validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-present required property is invalid", async () => {
      const result = await validate({ "bar": 1 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", async () => {
      const result = await validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores strings", async () => {
      const result = await validate("");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
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
      const doc = await Hyperjump.get(testDomain + "/required-default-validation", Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("not required by default", async () => {
      const result = await validate({});
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
      const doc = await Hyperjump.get(testDomain + "/required-with-empty-array", Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("property not required", async () => {
      const result = await validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
