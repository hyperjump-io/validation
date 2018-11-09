import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid validation value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-validation-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "validation": 4
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/validation", false]]);
    });
  });

  describe("validation validation", () => {
    let validate;

    before(async () => {
      const url = "/validation-validation";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "validation": true
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("value is a validation doc", () => {
      const result = validate({ "type": "object" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("value is an invalid validation doc", () => {
      const result = validate({ "type": "foo" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("value is not a validation doc", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
