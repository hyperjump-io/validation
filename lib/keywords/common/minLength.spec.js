const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid minLength value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minLength-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minLength": "4"
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/minLength", false]]);
    });
  });

  describe("minLength validation", () => {
    let validate;

    before(async () => {
      const url = "/minLength-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "minLength": 2
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("longer is valid", async () => {
      const result = await validate("foo");
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate("fo");
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("too short is invalid", async () => {
      const result = await validate("f");
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", async () => {
      const result = await validate(100);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("length is determined by number of UTF-8 code points", async () => {
      const result = await validate("\uD83D\uDCA9"); // length == 4
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
