import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid exclusiveMinimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-exclusiveMinimum-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "exclusiveMinimum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/exclusiveMinimum", false]]);
    });
  });

  describe("exclusiveMinimum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/exclusive-minimum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "exclusiveMinimum": 1.1
      });
      const doc = await JsonValidation.get(testDomain + "/exclusive-minimum-validation");
      validate = await JsonValidation.validate(doc);
    });

    it("above the exclusiveMinimum is valid", () => {
      const result = validate(1.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("below the exclusiveMinimum is invalid", () => {
      const result = validate(0.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
