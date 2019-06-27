const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid minProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minProperties-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minProperties": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/minProperties", false]]);
    });
  });

  describe("minProperties validation", () => {
    let validate;

    before(async () => {
      loadDoc("/minProperties-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minProperties": 1
      });
      const doc = await JVal.get(testDomain + "/minProperties-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("longer is valid", async () => {
      const result = await validate({ "foo": 1, "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too short is invalid", async () => {
      const result = await validate({});
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
});
