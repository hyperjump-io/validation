import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Schema", () => {
  describe("an invalid items value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-items-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "items": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/items", false]]);
    });
  });

  describe("a schema given for items", () => {
    let validate;

    before(async () => {
      const url = "/a-schema-given-for-items";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "items": { "type": "number" }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("valid items", () => {
      const result = validate([1, 2, 3]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("wrong type of items", () => {
      const result = validate([1, "x"]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", () => {
      const result = validate({
        "0": "invalid",
        "length": 1
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid uniqueItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-uniqueItems-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "uniqueItems": "true"
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/uniqueItems", false]]);
    });
  });

  describe("uniqueItems validation", () => {
    let validate;

    before(async () => {
      const url = "/unique-items-validation";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "uniqueItems": true
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("unique array of inteer is valid", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of numbers is invalid", () => {
      const result = validate([1, 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("numbers are unique if mathematically unequal", () => {
      const result = validate([1.0, 1.00, 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("unique array of objects is valid", () => {
      const result = validate([{ "foo": "bar" }, { "foo": "baz" }]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of objects is invalid", () => {
      const result = validate([{ "foo": "bar" }, { "foo": "bar" }]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("unique array of nested objects is valid", () => {
      const result = validate([
        { "foo": { "bar": { "baz": true } } },
        { "foo": { "bar": { "baz": false } } }
      ]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of nested objects is invalid", () => {
      const result = validate([
        { "foo": { "bar": { "baz": true } } },
        { "foo": { "bar": { "baz": true } } }
      ]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("unique array of arrays is valid", () => {
      const result = validate([["foo"], ["bar"]]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-unique array of arrays is invalid", () => {
      const result = validate([["foo"], ["foo"]]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("1 and true are unique", () => {
      const result = validate([1, true]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("0 and false are unique", () => {
      const result = validate([0, false]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("unique heterogneous types are valid", () => {
      const result = validate([{}, [1], true, null, 1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid tupleItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "tupleItems": {}
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-tupleItems-keyword-2";
      loadSchema(url, { "tupleItems": [false] });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/tupleItems", false]]);
    });
  });

  describe("an array of `tupleItems` schemas", () => {
    let validate;

    before(async () => {
      const url = "/an-array-of-tupleItems-schemas";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "tupleItems": [
          { "type": "number" },
          { "type": "string" }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("correct types", () => {
      const result = validate([1, "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("wrong types", () => {
      const result = validate(["foo", 1]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("incomplete array of items", () => {
      const result = validate([1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("array with addtional items", () => {
      const result = validate([1, "foo", true]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("empty array", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("JavaScript pseudo-array is valid", () => {
      const result = validate({
        "0": "invalid",
        "1": "valid",
        "length": 2
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid maxItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxItems-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maxItems": "5"
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/maxItems", false]]);
    });
  });

  describe("maxItems validation", () => {
    let validate;

    before(async () => {
      const url = "/maxItems-validation";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maxItems": 2
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("shorter is valid", () => {
      const result = validate([1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too long is invalid", () => {
      const result = validate([1, 2, 3]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid minItems value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minItems-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minItems": "5"
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/minItems", false]]);
    });
  });

  describe("minItems validation", () => {
    let validate;

    before(async () => {
      const url = "/minItems-validation";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minItems": 1
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("longer is valid", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate([1]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too short is invalid", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-arrays", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
