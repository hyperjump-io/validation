import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid maximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maximum-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maximum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/maximum", false]]);
    });
  });

  describe("maximum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/maximum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maximum": 3.0
      });
      const doc = await JsonValidation.get(testDomain + "/maximum-validation");
      validate = await JsonValidation.validate(doc);
    });

    it("below the maximum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("above the maximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
