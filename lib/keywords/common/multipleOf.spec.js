import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid multipleOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-multipleOf-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/multipleOf", false]]);
    });
  });

  describe("multipleOf int", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-int";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": 2
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("by int", () => {
      const result = validate(10);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("by int fail", () => {
      const result = validate(7);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("multipleOf number", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-number";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": 1.5
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("zero is multiple of anything", () => {
      const result = validate(0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("4.5 is multiple of 1.5", () => {
      const result = validate(4.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("35 is not multiple of 1.5", () => {
      const result = validate(35);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("multipleOf small number", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-small-number";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": 0.0001
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("0.0075 is multiple of 0.0001", () => {
      const result = validate(0.0075);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("0.00751 is multiple of 0.0001", () => {
      const result = validate(0.00751);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
