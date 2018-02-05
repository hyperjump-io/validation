const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");


describe("JSON Schema", () => {
  jsonSchemaTestSuite("properties", "draft4");
  jsonSchemaTestSuite("patternProperties", "draft4");
  jsonSchemaTestSuite("maxProperties", "draft4");
  jsonSchemaTestSuite("minProperties", "draft4");
  jsonSchemaTestSuite("required", "draft4");

  describe('a schema with a `propertyNames` keyword', () => {
    const schema = JsonSchema("#", `{
      "propertyNames": { "maxLength": 3, "minLength": 3 }
    }`);

    it("should be true if all property names are valid against the schema", () => {
      expect(JsonSchema.validate(schema)({ "foo": "" })).to.eql(true);
    });

    it("should not be true if any property names are valid against the schema", () => {
      expect(JsonSchema.validate(schema)({ "abcd": "" })).to.eql(false);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });
  });
});
