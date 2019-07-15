const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid pattern value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-pattern-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "pattern": 4
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/pattern", false]]);
    });
  });

  describe("pattern validation", () => {
    let validate;

    before(async () => {
      const url = "/pattern-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "pattern": "^a*$"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("a matching pattern is valid", async () => {
      const result = await validate("aaa");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("a non-matching pattern is invalid", async () => {
      const result = await validate("abc");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(true);
    });
  });

  describe("pattern is not anchored", () => {
    let validate;

    before(async () => {
      const url = "/pattern-is-not-anchored";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "pattern": "a+"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("matches a substring", async () => {
      const result = await validate("xxaayy");
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
