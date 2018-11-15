import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid tupleItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "tupleItems": {}
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword-2";
      loadDoc(url, { "tupleItems": [false] });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupelItems";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "foo" }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", true]]);
    });
  });

  describe("an array of `tupleItems`", () => {
    let validate;

    before(async () => {
      const url = "/an-array-of-tupleItems";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "number" },
          { "type": "string" }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("correct types", () => {
      const result = validate([1, "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("wrong types", () => {
      const result = validate(["foo", 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("incomplete array of items", () => {
      const result = validate([1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("array with additional items", () => {
      const result = validate([1, "foo", true]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("empty array", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", () => {
      const result = validate({
        "0": "invalid",
        "1": "valid",
        "length": 2
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});