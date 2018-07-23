import {  expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  jsonSchemaTestSuite("multipleOf", "draft4");

  describe(`a schema with a 'maximum' keyword`, () => {
    let validate;

    before(async () => {
      loadSchema("/maximum-1", { "maximum": 3.5 });
      const schema = await JsonSpec.get(testDomain + "/maximum-1");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true if the value is equal to the maximum", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should be true if the value is less than to the maximum", () => {
      const result = validate(3.4);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the value is greater than the maximum", () => {
      const result = validate(3.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with a 'exclusiveMaximum' keyword`, () => {
    let validate;

    before(async () => {
      loadSchema("/exclusive-maximum-1", { "exclusiveMaximum": 3.5 });
      const schema = await JsonSpec.get(testDomain + "/exclusive-maximum-1");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true if the value is less than the maximum", () => {
      const result = validate(3.4);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the value is equal to the maximum", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should not be true if the value is greater than the maximum", () => {
      const result = validate(3.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with a 'minimum' keyword`, () => {
    let validate;

    before(async () => {
      loadSchema("/minimum-1", { "minimum": 3.5 });
      const schema = await JsonSpec.get(testDomain + "/minimum-1");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true if the value is equal to the minimum", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should be true if the value is greater than the minimum", () => {
      const result = validate(3.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the value is less than the maximum", () => {
      const result = validate(3.4);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with a 'exclusiveMinimum' keyword`, () => {
    let validate;

    before(async () => {
      loadSchema("/exclusive-minimum-1", { "exclusiveMinimum": 3.5 });
      const schema = await JsonSpec.get(testDomain + "/exclusive-minimum-1");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true if the value is greater than the maximum", () => {
      const result = validate(3.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the value is equal to the maximum", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should not be true if the value is less than the maximum", () => {
      const result = validate(3.4);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
