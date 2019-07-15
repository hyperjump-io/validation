const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid minItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minItems": "5"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/minItems", false]]);
    });
  });

  describe("minItems validation", () => {
    let validate;

    before(async () => {
      const url = "/minItems-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minItems": 1
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("longer is valid", async () => {
      const result = await validate([1, 2]);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate([1]);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("too short is invalid", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", async () => {
      const result = await validate("foobar");
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
