const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid exclusiveMinimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-exclusiveMinimum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "exclusiveMinimum": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/exclusiveMinimum", false]]);
    });
  });

  describe("exclusiveMinimum validation", () => {
    let validate;

    before(async () => {
      loadDoc("/exclusive-minimum-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "exclusiveMinimum": 1.1
      });
      const doc = Hyperjump.fetch(testDomain + "/exclusive-minimum-validation");
      validate = await Validation.validate(doc);
    });

    it("above the exclusiveMinimum is valid", async () => {
      const result = await validate(1.2);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", async () => {
      const result = await validate(1.1);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("below the exclusiveMinimum is invalid", async () => {
      const result = await validate(0.6);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("x");
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
