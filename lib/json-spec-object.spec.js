import { expect } from "chai";
import JsonSpec from "@/json-spec";
import jsonSchemaTestSuite from "@/json-schema-test-suite.spec";
import * as ValidationResult from "@/validation-result";


describe("JSON Schema", () => {
  jsonSchemaTestSuite("properties", "draft4");
  jsonSchemaTestSuite("patternProperties", "draft4");
  jsonSchemaTestSuite("maxProperties", "draft4");
  jsonSchemaTestSuite("minProperties", "draft4");
  jsonSchemaTestSuite("required", "draft4");

  describe(`a schema with a 'required' keyword`, () => {
    const schema = JsonSpec("#", `{
      "properties": {
        "bar": { "type": "integer" }
      },
      "required": ["bar"]
    }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if all required properties are present", () => {
      const result = validate({ "foo": "baz", "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with a 'propertyNames' keyword`, () => {
    const schema = JsonSpec("#", `{
      "propertyNames": { "maxLength": 3, "minLength": 3 }
    }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if all property names are valid against the schema", () => {
      const result = validate({ "foo": "" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if any property names are valid against the schema", () => {
      const result = validate({ "abcd": "" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if it is not an object", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
