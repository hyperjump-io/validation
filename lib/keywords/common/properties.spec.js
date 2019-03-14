const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
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
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
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
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-properties";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "type": "foo"
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
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
      const doc = await JsonValidation.get(testDomain + "/object-properties-validation");
      validate = await JsonValidation.validate(doc);
    });

    it("both properties present and valid is valid", () => {
      const result = validate({ "foo": 1, "bar": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("one property present invalid is invalid", () => {
      const result = validate({ "foo": 1, "bar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("both property invalid is invalid", () => {
      const result = validate({ "foo": [], "bar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("doesn't invalidate other properties", () => {
      const result = validate({ "quux": [] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
