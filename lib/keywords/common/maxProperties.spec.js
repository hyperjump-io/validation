const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid maxProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxProperties-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maxProperties": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/maxProperties", false]]);
    });
  });

  describe("maxProperties validation", () => {
    let validate;

    before(async () => {
      loadDoc("/maxProperties-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "maxProperties": 2
      });
      const doc = Hyperjump.fetch(testDomain + "/maxProperties-validation");
      validate = await Validation.validate(doc);
    });

    it("shorter is valid", async () => {
      const result = await validate({ "foo": 1 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("exact length is valid", async () => {
      const result = await validate({ "foo": 1, "bar": 2 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("too long is invalid", async () => {
      const result = await validate({ "foo": 1, "bar": 2, "baz": 3 });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores arrays", async () => {
      const result = await validate([]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores strings", async () => {
      const result = await validate("foobar");
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
