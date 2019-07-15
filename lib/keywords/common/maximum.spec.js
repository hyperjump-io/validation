const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid maximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maximum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maximum": true
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/maximum", false]]);
    });
  });

  describe("maximum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/maximum-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maximum": 3.0
      });
      const doc = Hyperjump.get(testDomain + "/maximum-validation", Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("below the maximum is valid", async () => {
      const result = await validate(2.6);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", async () => {
      const result = await validate(3.0);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("above the maximum is invalid", async () => {
      const result = await validate(3.5);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("x");
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
