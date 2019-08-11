const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid propertyNames value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-propertyNames-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "propertyNames": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/propertyNames", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-propertyNames";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "propertyNames": { "type": "foo" }
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/propertyNames", false]]);
    });
  });

  describe("propertyNames validation", () => {
    let validate;

    before(async () => {
      loadDoc("/propertyNames-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "propertyNames": { "maxLength": 3 }
      });
      const doc = Hyperjump.fetch(testDomain + "/propertyNames-validation");
      validate = await Validation.validate(doc);
    });

    it("all property names valid", async () => {
      const result = await validate({ "f": {}, "foo": {} });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("some property names invalid", async () => {
      const result = await validate({ "foo": {}, "foobar": {} });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("object without properties is valid", async () => {
      const result = await validate({});
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores arrays", async () => {
      const result = await validate([1, 2, 3, 4]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores string", async () => {
      const result = await validate("foobar");
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
