import {  expect } from "chai";
import * as JsonSpec from "~/json-spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  jsonSchemaTestSuite("multipleOf", "draft4");

  describe(`a schema with a 'maximum' keyword`, () => {
    const schema = JsonSpec.load("#", `{ "maximum": 3.5 }`);
    const validate = JsonSpec.validate(schema);

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
    const schema = JsonSpec.load("#", `{ "exclusiveMaximum": 3.5 }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if the value is less than the maximum", () => {
      const result = validate(3.4);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the value is equal to the maximum", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should not be true if the value is greater than to the maximum", () => {
      const result = validate(3.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with a 'minimum' keyword`, () => {
    const schema = JsonSpec.load("#", `{ "minimum": 3.5 }`);
    const validate = JsonSpec.validate(schema);

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
    const schema = JsonSpec.load("#", `{ "exclusiveMinimum": 3.5 }`);
    const validate = JsonSpec.validate(schema);

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
