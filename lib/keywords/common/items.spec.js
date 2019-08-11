const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid items value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-items-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "items": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/items", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-items";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "items": {
          "type": "foo"
        }
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/items", false]]);
    });
  });

  describe("a document given for items", () => {
    let validate;

    before(async () => {
      const url = "/a-document-given-for-items";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "items": { "type": "number" }
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("valid items", async () => {
      const result = await validate([1, 2, 3]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("wrong type of items", async () => {
      const result = await validate([1, "x"]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", async () => {
      const result = await validate({ "foo": "bar" });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", async () => {
      const result = await validate({
        "0": "invalid",
        "length": 1
      });
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
