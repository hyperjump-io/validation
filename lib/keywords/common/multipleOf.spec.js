const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid multipleOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-multipleOf-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "multipleOf": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/multipleOf", false]]);
    });
  });

  describe("multipleOf int", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-int";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "multipleOf": 2
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("by int", async () => {
      const result = await validate(10);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("by int fail", async () => {
      const result = await validate(7);
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", async () => {
      const result = await validate("foo");
      expect(Validation.isValid(result)).to.eql(true);
    });
  });

  describe("multipleOf number", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-number";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "multipleOf": 1.5
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("zero is multiple of anything", async () => {
      const result = await validate(0);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("4.5 is multiple of 1.5", async () => {
      const result = await validate(4.5);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("35 is not multiple of 1.5", async () => {
      const result = await validate(35);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("multipleOf small number", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-small-number";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "multipleOf": 0.0001
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("0.0075 is multiple of 0.0001", async () => {
      const result = await validate(0.0075);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("0.00751 is multiple of 0.0001", async () => {
      const result = await validate(0.00751);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });
});
