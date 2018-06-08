const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");
const ValidationResult = require("./validation-result");


describe("JSON Schema", () => {
  describe('a schema with a `$ref`', () => {
    const schema = JsonSchema("#", `{
      "properties": {
        "foo": { "$ref": "#/definitions/foo" }
      },
      "definitions": {
        "foo": { "type": "string" }
      }
    }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if a property matches and the schema validates", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if a property matches and the schema is not valid", () => {
      const result = validate({ "foo": 6 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if for any property not in `properties`", () => {
      const result = validate({ "bar": 6 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should be true if it is not an object", () => {
      const result = validate(6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  jsonSchemaTestSuite("ref", "draft4");

  describe("root pointer ref", () => {
    const schema = JsonSchema("#", `{
      "properties": {
        "foo": { "$ref": "#" }
      }
    }`);
    const validate = JsonSchema.validate(schema);

    it("match", () => {
      const result = validate({"foo": false});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("recursive match", () => {
      const result = validate({"foo": {"foo": false}});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
