const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid minimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minimum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minimum": true
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/minimum", false]]);
    });
  });

  describe("minimum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/minimum-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minimum": 1.1
      });
      const doc = await Hyperjump.get(testDomain + "/minimum-validation", Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("above the minimum is valid", async () => {
      const result = await validate(2.6);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("below the minimum is invalid", async () => {
      const result = await validate(0.6);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("x");
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
