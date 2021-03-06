const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid uniqueItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-uniqueItems-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "uniqueItems": "true"
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/uniqueItems", false]]);
    });
  });

  describe("uniqueItems validation", () => {
    let validate;

    before(async () => {
      const url = "/unique-items-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "uniqueItems": true
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("unique array of inteer is valid", async () => {
      const result = await validate([1, 2]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("non-unique array of numbers is invalid", async () => {
      const result = await validate([1, 1]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("numbers are unique if mathematically unequal", async () => {
      const result = await validate([1.0, 1.00, 1]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("unique array of objects is valid", async () => {
      const result = await validate([{ "foo": "bar" }, { "foo": "baz" }]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("non-unique array of objects is invalid", async () => {
      const result = await validate([{ "foo": "bar" }, { "foo": "bar" }]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("unique array of nested objects is valid", async () => {
      const result = await validate([
        { "foo": { "bar": { "baz": true } } },
        { "foo": { "bar": { "baz": false } } }
      ]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("non-unique array of nested objects is invalid", async () => {
      const result = await validate([
        { "foo": { "bar": { "baz": true } } },
        { "foo": { "bar": { "baz": true } } }
      ]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("unique array of arrays is valid", async () => {
      const result = await validate([["foo"], ["bar"]]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("non-unique array of arrays is invalid", async () => {
      const result = await validate([["foo"], ["foo"]]);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("1 and true are unique", async () => {
      const result = await validate([1, true]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("0 and false are unique", async () => {
      const result = await validate([0, false]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("unique heterogneous types are valid", async () => {
      const result = await validate([{}, [1], true, null, 1]);
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
