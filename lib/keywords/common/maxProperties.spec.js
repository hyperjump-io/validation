const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid maxProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxProperties-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maxProperties": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/maxProperties", false]]);
    });
  });

  describe("maxProperties validation", () => {
    let validate;

    before(async () => {
      loadDoc("/maxProperties-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maxProperties": 2
      });
      const doc = await JsonValidation.get(testDomain + "/maxProperties-validation");
      validate = await JsonValidation.validate(doc);
    });

    it("shorter is valid", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate({ "foo": 1, "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too long is invalid", () => {
      const result = validate({ "foo": 1, "bar": 2, "baz": 3 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores strings", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
