const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid properties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-properties-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-properties-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": 3
        }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-properties";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "foo" }
        }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });
  });

  describe("object properties validation", () => {
    let validate;

    before(async () => {
      loadDoc("/object-properties-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "number" },
          "bar": { "type": "string" }
        }
      });
      const doc = await JVal.get(testDomain + "/object-properties-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("both properties present and valid is valid", async () => {
      const result = await validate({ "foo": 1, "bar": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("one property present invalid is invalid", async () => {
      const result = await validate({ "foo": 1, "bar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("both property invalid is invalid", async () => {
      const result = await validate({ "foo": [], "bar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("doesn't invalidate other properties", async () => {
      const result = await validate({ "quux": [] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores arrays", async () => {
      const result = await validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
