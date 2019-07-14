const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid not value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-not-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": "foo"
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/not", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-not";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": { "type": "foo" }
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/not", false]]);
    });
  });

  describe("not", () => {
    let validate;

    before(async () => {
      const url = "/not";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": { "type": "number" }
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("allowed", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("disallowed", async () => {
      const result = await validate(1);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("not more complex", () => {
    let validate;

    before(async () => {
      const url = "/not-more-complex";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": {
          "type": "object",
          "properties": {
            "foo": { "type": "string" }
          }
        }
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("match", async () => {
      const result = await validate(1);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("other match", async () => {
      const result = await validate({ "foo": 1 });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("mismatch", async () => {
      const result = await validate({ "foo": "bar" });
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("forbidden property", () => {
    let validate;

    before(async () => {
      const url = "/forbidden-property";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "not": {} }
        }
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("property present", async () => {
      const result = await validate({ "foo": 1, "bar": 2 });
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("property absent", async () => {
      const result = await validate({ "bar": 1, "baz": 2 });
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
