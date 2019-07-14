const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal =  require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid oneOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-oneOf-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": {}
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/oneOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-oneOf-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [{}, "foo"]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/oneOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-oneOf";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [{ "type": "foo" }]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/oneOf", false]]);
    });
  });

  describe("oneOf", () => {
    let validate;

    before(async () => {
      const url = "/oneOf";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [
          { "maximum": 2 },
          { "minimum": 4 }
        ]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("first oneOf valid", async () => {
      const result = await validate(1);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("second oneOf valid", async () => {
      const result = await validate(5);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("neither oneOf valid", async () => {
      const result = await validate(3);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("oneOf with base", () => {
    let validate;

    before(async () => {
      const url = "/oneOf-with-base";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "string",
        "oneOf": [
          { "minLength": 2 },
          { "maxLength": 4 }
        ]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("mismatch base", async () => {
      const result = await validate(3);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("one oneOf valid", async () => {
      const result = await validate("foobar");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("both oneOf valid", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("oneOf complex types", () => {
    let validate;

    before(async () => {
      const url = "/oneOf-complex-types";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [
          {
            "properties": {
              "bar": { "type": "number" }
            },
            "required": ["bar"]
          },
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          }
        ]
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("first oneOf valid (complex)", async () => {
      const result = await validate({ "bar": 2 });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("second oneOf valid (complex)", async () => {
      const result = await validate({ "foo": "baz" });
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("both oneOf valid (complex)", async () => {
      const result = await validate({ "foo": "baz", "bar": 2 });
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("neither oneOf valid (complex)", async () => {
      const result = await validate({ "foo": 2, "bar": "quux" });
      expect(HVal.isValid(result)).to.eql(false);
    });
  });
});
