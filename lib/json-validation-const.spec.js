import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("const validation", () => {
    let validate;

    before(async () => {
      const url = "/const-validation";
      loadSchema(url, { "const": 2 });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("same value is valid", () => {
      const result = validate(2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another value is invalid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("another type is invalid", () => {
      const result = validate("a");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("const with object", () => {
    let validate;

    before(async () => {
      const url = "/const-with-object";
      loadSchema(url, { "const": { "foo": "bar", "baz": "bax" } });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("same object is valid", () => {
      const result = validate({ "foo": "bar", "baz": "bax" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("same object with different property order is valid", () => {
      const result = validate({ "baz": "bax", "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another object is invalid", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("another type is invalid", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("const with array", () => {
    let validate;

    before(async () => {
      const url = "/const-with-array";
      loadSchema(url, { "const": [{ "foo": "bar" }] });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("same array is valid", () => {
      const result = validate([{ "foo": "bar" }]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("another array item is invalid", () => {
      const result = validate([2]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("array with additional items is invalid", () => {
      const result = validate([1, 2, 3]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("const with null", () => {
    let validate;

    before(async () => {
      const url = "/const-with-null";
      loadSchema(url, { "const": null });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("null is valid", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("not null is invalid", () => {
      const result = validate(0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
