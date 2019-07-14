const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid maxLength value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxLength-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maxLength": "4"
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/maxLength", false]]);
    });
  });

  describe("maxLength validation", () => {
    let validate;

    before(async () => {
      const url = "/maxLength-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maxLength": 2
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("shorter is valid", async () => {
      const result = await validate("f");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate("fo");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("too long is invalid", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", async () => {
      const result = await validate(100);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("length is determined by number of UTF-8 code points", async () => {
      const result = await validate("\uD83D\uDCA9"); // length == 4
      expect(HVal.isValid(result)).to.eql(false);
    });
  });
});
