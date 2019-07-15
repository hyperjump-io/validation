const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid properties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-properties-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": true
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-properties-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": 3
        }
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-properties";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "foo" }
        }
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });
  });

  describe("object properties validation", () => {
    let validate;

    before(async () => {
      loadDoc("/object-properties-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "number" },
          "bar": { "type": "string" }
        }
      });
      const doc = Hyperjump.get(testDomain + "/object-properties-validation", Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("both properties present and valid is valid", async () => {
      const result = await validate({ "foo": 1, "bar": "baz" });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("one property present invalid is invalid", async () => {
      const result = await validate({ "foo": 1, "bar": {} });
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("both property invalid is invalid", async () => {
      const result = await validate({ "foo": [], "bar": {} });
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("doesn't invalidate other properties", async () => {
      const result = await validate({ "quux": [] });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("ignores arrays", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
