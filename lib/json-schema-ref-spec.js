const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");


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
      expect(validate({ "foo": "bar" })).to.eql(true);
    });

    it("should not be true if a property matches and the schema is not valid", () => {
      expect(validate({ "foo": 6 })).to.eql(false);
    });

    it("should be true if for any property not in `properties`", () => {
      expect(validate({ "bar": 6 })).to.eql(true);
    });

    it("should be true if it is not an object", () => {
      expect(validate(6)).to.eql(true);
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
      expect(validate({"foo": false})).to.eql(true);
    });

    it("recursive match", () => {
      expect(validate({"foo": {"foo": false}})).to.eql(true);
    });
  });
});
