const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid validation value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-validation-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "validation": 4
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/validation", false]]);
    });
  });

  describe("validation validation", () => {
    let validate;

    before(async () => {
      const url = "/validation-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "validation": true
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("value is a validation doc", async () => {
      const result = await validate({ "type": "object" });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("value is an invalid validation doc", async () => {
      const result = await validate({ "type": "foo" });
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("value is not a validation doc", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
