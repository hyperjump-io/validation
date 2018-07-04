import { expect } from "chai";
import JsonSpec from "~/json-spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  jsonSchemaTestSuite("items", "draft4");
  jsonSchemaTestSuite("maxItems", "draft4");
  jsonSchemaTestSuite("minItems", "draft4");
  jsonSchemaTestSuite("uniqueItems", "draft4");

  describe(`a schema with a '"uniqueItems": false' keyword`, () => {
    const schema = JsonSpec("#", `{ "uniqueItems": false }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if all values are unique", () => {
      const result = validate(["foo", 4]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should be true if all values are not unique", () => {
      const result = validate(["foo", "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("a schema with a `tupleItems` keyword", () => {
    const schema = JsonSpec("#", `{
      "tupleItems": [
        { "type": "string" },
        { "type": "number" }
      ]
    }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if the items match the schemas in order", () => {
      const result = validate(["foo", 4]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should be true if there are fewer items then the keyword specifies", () => {
      const result = validate(["foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if one of items do not match", () => {
      const result = validate(["foo", "bar"]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should not be true if the items are not in the right order", () => {
      const result = validate([4, "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not an array", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
