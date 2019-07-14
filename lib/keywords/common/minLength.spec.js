const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid minLength value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minLength-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minLength": "4"
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/minLength", false]]);
    });
  });

  describe("minLength validation", () => {
    let validate;

    before(async () => {
      const url = "/minLength-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minLength": 2
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("longer is valid", async () => {
      const result = await validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate("fo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too short is invalid", async () => {
      const result = await validate("f");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", async () => {
      const result = await validate(100);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("length is determined by number of UTF-8 code points", async () => {
      const result = await validate("\uD83D\uDCA9"); // length == 4
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
