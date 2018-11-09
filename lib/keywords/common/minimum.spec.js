import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid minimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minimum-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minimum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/minimum", false]]);
    });
  });

  describe("minimum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/minimum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minimum": 1.1
      });
      const doc = await JsonValidation.get(testDomain + "/minimum-validation");
      validate = await JsonValidation.validate(doc);
    });

    it("above the minimum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("below the minimum is invalid", () => {
      const result = validate(0.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
