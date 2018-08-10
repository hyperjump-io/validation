import {  expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("maximum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/maximum-validation", { "maximum": 3.0 });
      const schema = await JsonValidation.get(testDomain + "/maximum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("below the maximum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("above the maximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("exclusiveMaximum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/exclusive-maximum-validation", { "exclusiveMaximum": 3.0 });
      const schema = await JsonValidation.get(testDomain + "/exclusive-maximum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("below the exclusiveMaximum is valid", () => {
      const result = validate(2.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("above the exclusiveMaximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("minimum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/minimum-validation", { "minimum": 1.1 });
      const schema = await JsonValidation.get(testDomain + "/minimum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("above the minimum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("below the minimum is invalid", () => {
      const result = validate(0.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("exclusiveMinimum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/exclusive-minimum-validation", { "exclusiveMinimum": 1.1 });
      const schema = await JsonValidation.get(testDomain + "/exclusive-minimum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("above the exclusiveMinimum is valid", () => {
      const result = validate(1.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("below the exclusiveMinimum is invalid", () => {
      const result = validate(0.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("by int", () => {
    let validate;

    before(async () => {
      loadSchema("/by-int", { "multipleOf": 2 });
      const schema = await JsonValidation.get(testDomain + "/by-int");
      validate = await JsonValidation.validate(schema);
    });

    it("int by int", () => {
      const result = validate(10);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("int by int fail", () => {
      const result = validate(7);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("by number", () => {
    let validate;

    before(async () => {
      loadSchema("/by-number", { "multipleOf": 1.5 });
      const schema = await JsonValidation.get(testDomain + "/by-number");
      validate = await JsonValidation.validate(schema);
    });

    it("zero is multiple of anything", () => {
      const result = validate(0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("4.5 is multiple of 1.5", () => {
      const result = validate(4.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("35 is not multiple of 1.5", () => {
      const result = validate(35);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("by small number", () => {
    let validate;

    before(async () => {
      loadSchema("/by-small-number", { "multipleOf": 0.0001 });
      const schema = await JsonValidation.get(testDomain + "/by-small-number");
      validate = await JsonValidation.validate(schema);
    });

    it("0.0075 is multiple of 0.0001", () => {
      const result = validate(0.0075);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("0.00751 is multiple of 0.0001", () => {
      const result = validate(0.00751);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
