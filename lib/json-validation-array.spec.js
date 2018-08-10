import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("a schema given for items", () => {
    let validate;

    before(async () => {
      const url = "/a-schema-given-for-items";
      loadSchema(url, { "items": { "type": "number" } });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
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

  describe("uniqueItems validation", () => {
    let validate;

    before(async () => {
      const url = "/unique-items-validation";
      loadSchema(url, { "uniqueItems": true });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
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

  describe("an array of `tupleItems` schemas", () => {
    let validate;

    before(async () => {
      const url = "/an-array-of-tupleItems-schemas";
      loadSchema(url, {
        "tupleItems": [
          { "type": "number" },
          { "type": "string" }
        ]
      });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
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

  describe("maxItems validation", () => {
    let validate;

    before(async () => {
      const url = "/maxItems-validation";
      loadSchema(url, { "maxItems": 2 });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
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

  describe("minItems validation", () => {
    let validate;

    before(async () => {
      const url = "/minItems-validation";
      loadSchema(url, { "minItems": 1 });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
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
