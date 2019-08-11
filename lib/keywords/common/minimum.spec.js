const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid minimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minimum-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minimum": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
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
      const doc = Hyperjump.fetch(testDomain + "/minimum-validation");
      validate = await Validation.validate(doc);
    });

    it("above the minimum is valid", async () => {
      const result = await validate(2.6);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", async () => {
      const result = await validate(1.1);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("below the minimum is invalid", async () => {
      const result = await validate(0.6);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("x");
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
