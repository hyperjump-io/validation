const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const ValidationResult = require("./validation-result");


describe("JSON Schema", () => {
  describe('a schema with `"const": "foo"`', () => {
    const schema = JsonSchema("#", `{ "const": "foo" }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the data is 'foo'", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the data is not 'foo'", () => {
      const result = validate(6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe('a schema with `"const": {}`', () => {
    const schema = JsonSchema("#", `{ "const": {} }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the data is {}", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe('a schema with `"const": { "foo": "bar", "bar": "foo" }`', () => {
    const schema = JsonSchema("#", `{ "const": { "foo": "bar", "bar": "foo" } }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the data is {}", () => {
      const result = validate({ "bar": "foo", "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
