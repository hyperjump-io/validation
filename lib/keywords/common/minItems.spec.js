const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid minItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minItems": "5"
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("longer is valid", async () => {
      const result = await validate([1, 2]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate([1]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("too short is invalid", async () => {
      const result = await validate([]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", async () => {
      const result = await validate("foobar");
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
