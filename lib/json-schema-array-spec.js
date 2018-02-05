const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");


describe("JSON Schema", () => {
  jsonSchemaTestSuite("items", "draft4");
  jsonSchemaTestSuite("maxItems", "draft4");
  jsonSchemaTestSuite("minItems", "draft4");
  jsonSchemaTestSuite("uniqueItems", "draft4");

  describe('a schema with a `tupleItems` keyword', () => {
    const schema = JsonSchema("#", `{
      "tupleItems": [
        { "type": "string" },
        { "type": "number" }
      ]
    }`);

    it("should be true if the items match the schemas in order", () => {
      expect(JsonSchema.validate(schema)(["foo", 4])).to.eql(true);
    });

    it("should be true if there are fewer items then the keyword specifies", () => {
      expect(JsonSchema.validate(schema)(["foo"])).to.eql(true);
    });

    it("should not be true if one of items do not match", () => {
      expect(JsonSchema.validate(schema)(["foo", "bar"])).to.eql(false);
    });

    it("should not be true if the items are not in the right order", () => {
      expect(JsonSchema.validate(schema)([4, "foo"])).to.eql(false);
    });

    it("should be true if it is not an array", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });
  });
});
