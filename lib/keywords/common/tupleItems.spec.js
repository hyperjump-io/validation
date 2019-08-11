const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid tupleItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": {}
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword-2";
      loadDoc(url, { "tupleItems": [false] });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupelItems";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "foo" }
        ]
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", true]]);
    });
  });

  describe("an array of `tupleItems`", () => {
    let validate;

    before(async () => {
      const url = "/an-array-of-tupleItems";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "number" },
          { "type": "string" }
        ]
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("correct types", async () => {
      const result = await validate([1, "foo"]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("wrong types", async () => {
      const result = await validate(["foo", 1]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("incomplete array of items", async () => {
      const result = await validate([1]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("array with additional items", async () => {
      const result = await validate([1, "foo", true]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("empty array", async () => {
      const result = await validate([]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", async () => {
      const result = await validate({
        "0": "invalid",
        "1": "valid",
        "length": 2
      });
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
