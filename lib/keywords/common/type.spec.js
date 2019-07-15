const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid type value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-type-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": 4
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/type", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-type-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "foo"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
        .to.be.rejectedWith([["/type", false]]);
    });
  });

  describe("an empty document", () => {
    let validate;

    before(async () => {
      loadDoc("/type-1", {});
      const doc = Hyperjump.get(testDomain + "/type-1", Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("should be true for any value", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(true);
    });
  });

  describe("number type matches numbers", () => {
    let validate;

    before(async () => {
      const url = "/number-type-matches-numbers";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "number"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("a float is a number", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("a string is not a number", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a string is still not a number, even if it looks like one", async () => {
      const result = await validate("1");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an object is not a number", async () => {
      const result = await validate({});
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an array is not a number", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a boolean is not a number", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("null is not a number", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("string type matches strings", () => {
    let validate;

    before(async () => {
      const url = "/string-type-matches-strings";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "string"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("1 is not a string", async () => {
      const result = await validate(1);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a float is not a string", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a string is a string", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("a string is still a string, even if it looks like a number", async () => {
      const result = await validate("1");
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("an object is not a string", async () => {
      const result = await validate({});
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an array is not a string", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a boolean is not a string", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("null is not a string", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("object type matches objects", () => {
    let validate;

    before(async () => {
      const url = "/object-type-matches-objects";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "object"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("a float is not an object", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a string is not an object", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an object is an object", async () => {
      const result = await validate({});
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("an array is not an object", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a boolean is not an object", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("null is not an object", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("array type matches arrays", () => {
    let validate;

    before(async () => {
      const url = "/array-type-matches-array";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "array"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("a float is not an array", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a string is not an array", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an object is not an array", async () => {
      const result = await validate({});
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an array is an array", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("a boolean is not an array", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("null is not an array", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("boolean type matches booleans", () => {
    let validate;

    before(async () => {
      const url = "/boolean-type-matches-booleans";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "boolean"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("a float is not a boolean", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a string is not a boolean", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an object is not a boolean", async () => {
      const result = await validate({});
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an array is not a boolean", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a boolean is a boolean", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("null is not a boolean", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("null type matches only the null object", () => {
    let validate;

    before(async () => {
      const url = "/null-type-matches-only-the-null-object";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "null"
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("a float is not null", async () => {
      const result = await validate(1.1);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a string is not null", async () => {
      const result = await validate("foo");
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an object is not null", async () => {
      const result = await validate({});
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("an array is not null", async () => {
      const result = await validate([]);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("a boolean is not null", async () => {
      const result = await validate(true);
      expect(HVal.isValid(result)).to.eql(false);
    });

    it("null is null", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
