const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid maxItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maxItems": "5"
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/maxItems", false]]);
    });
  });

  describe("maxItems validation", () => {
    let validate;

    before(async () => {
      const url = "/maxItems-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maxItems": 2
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("shorter is valid", async () => {
      const result = await validate([1]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate([1, 2]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("too long is invalid", async () => {
      const result = await validate([1, 2, 3]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", async () => {
      const result = await validate("foobar");
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
