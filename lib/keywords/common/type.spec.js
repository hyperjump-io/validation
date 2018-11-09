import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid type value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-type-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": 4
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/type", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-type-keyword-2";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "foo"
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/type", false]]);
    });
  });

  describe("an empty document", () => {
    let validate;

    before(async () => {
      loadDoc("/type-1", {});
      const doc = await JsonValidation.get(testDomain + "/type-1");
      validate = await JsonValidation.validate(doc);
    });

    it("should be true for any value", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("number type matches numbers", () => {
    let validate;

    before(async () => {
      const url = "/number-type-matches-numbers";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "number"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("a float is a number", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a string is not a number", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a string is still not a number, even if it looks like one", () => {
      const result = validate("1");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an object is not a number", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an array is not a number", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a boolean is not a number", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("null is not a number", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("string type matches strings", () => {
    let validate;

    before(async () => {
      const url = "/string-type-matches-strings";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "string"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("1 is not a string", () => {
      const result = validate(1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a float is not a string", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a string is a string", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a string is still a string, even if it looks like a number", () => {
      const result = validate("1");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("an object is not a string", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an array is not a string", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a boolean is not a string", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("null is not a string", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("object type matches objects", () => {
    let validate;

    before(async () => {
      const url = "/object-type-matches-objects";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "object"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("a float is not an object", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a string is not an object", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an object is an object", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("an array is not an object", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a boolean is not an object", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("null is not an object", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("array type matches arrays", () => {
    let validate;

    before(async () => {
      const url = "/array-type-matches-array";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "array"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("a float is not an array", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a string is not an array", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an object is not an array", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an array is an array", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a boolean is not an array", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("null is not an array", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("boolean type matches booleans", () => {
    let validate;

    before(async () => {
      const url = "/boolean-type-matches-booleans";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "boolean"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("a float is not a boolean", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a string is not a boolean", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an object is not a boolean", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an array is not a boolean", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a boolean is a boolean", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("null is not a boolean", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("null type matches only the null object", () => {
    let validate;

    before(async () => {
      const url = "/null-type-matches-only-the-null-object";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "null"
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("a float is not null", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a string is not null", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an object is not null", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an array is not null", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("a boolean is not null", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("null is null", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
