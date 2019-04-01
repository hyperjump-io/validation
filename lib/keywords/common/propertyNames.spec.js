const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid propertyNames value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-propertyNames-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "propertyNames": true
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/propertyNames", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-propertyNames";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "propertyNames": { "type": "foo" }
      });
      const doc = await JVal.get(testDomain + url, JVal.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/propertyNames", false]]);
    });
  });

  describe("propertyNames validation", () => {
    let validate;

    before(async () => {
      loadDoc("/propertyNames-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "propertyNames": { "maxLength": 3 }
      });
      const doc = await JVal.get(testDomain + "/propertyNames-validation", JVal.nil);
      validate = await JVal.validate(doc);
    });

    it("all property names valid", () => {
      const result = validate({ "f": {}, "foo": {} });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("some property names invalid", () => {
      const result = validate({ "foo": {}, "foobar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("object without properties is valid", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores arrays", () => {
      const result = validate([1, 2, 3, 4]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores string", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
