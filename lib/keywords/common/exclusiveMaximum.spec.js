const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid exclusiveMaximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-exclusiveMaximum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "exclusiveMaximum": true
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/exclusiveMaximum", false]]);
    });
  });

  describe("exclusiveMaximum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/exclusive-maximum-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "exclusiveMaximum": 3.0
      });
      const doc = Hyperjump.get(testDomain + "/exclusive-maximum-validation", Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("below the exclusiveMaximum is valid", async () => {
      const result = await validate(2.2);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", async () => {
      const result = await validate(3.0);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("above the exclusiveMaximum is invalid", async () => {
      const result = await validate(3.5);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("x");
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
