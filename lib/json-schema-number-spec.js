const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");


describe("JSON Schema", () => {
  jsonSchemaTestSuite("multipleOf", "draft4");

  describe('a schema with a `maximum` keyword', () => {
    const schema = JsonSchema("#", `{ "maximum": 3.5 }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the value is equal to the maximum", () => {
      expect(validate(3.5)).to.eql(true);
    });

    it("should be true if the value is less than to the maximum", () => {
      expect(validate(3.4)).to.eql(true);
    });

    it("should not be true if the value is greater than the maximum", () => {
      expect(validate(3.6)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      expect(validate("foo")).to.eql(true);
    });
  });

  describe('a schema with a `exclusiveMaximum` keyword', () => {
    const schema = JsonSchema("#", `{ "exclusiveMaximum": 3.5 }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the value is less than the maximum", () => {
      expect(validate(3.4)).to.eql(true);
    });

    it("should not be true if the value is equal to the maximum", () => {
      expect(validate(3.5)).to.eql(false);
    });

    it("should not be true if the value is greater than to the maximum", () => {
      expect(validate(3.6)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      expect(validate("foo")).to.eql(true);
    });
  });

  describe('a schema with a `minimum` keyword', () => {
    const schema = JsonSchema("#", `{ "minimum": 3.5 }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the value is equal to the minimum", () => {
      expect(validate(3.5)).to.eql(true);
    });

    it("should be true if the value is greater than the minimum", () => {
      expect(validate(3.6)).to.eql(true);
    });

    it("should not be true if the value is less than the maximum", () => {
      expect(validate(3.4)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      expect(validate("foo")).to.eql(true);
    });
  });

  describe('a schema with a `exclusiveMinimum` keyword', () => {
    const schema = JsonSchema("#", `{ "exclusiveMinimum": 3.5 }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the value is greater than the maximum", () => {
      expect(validate(3.6)).to.eql(true);
    });

    it("should not be true if the value is equal to the maximum", () => {
      expect(validate(3.5)).to.eql(false);
    });

    it("should not be true if the value is less than the maximum", () => {
      expect(validate(3.4)).to.eql(false);
    });

    it("should be true if it is not a number", () => {
      expect(validate("foo")).to.eql(true);
    });
  });
});
