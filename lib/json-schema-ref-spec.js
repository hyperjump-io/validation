const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with a `$ref`', () => {
    const schema = {
      "properties": {
        "foo": { "$ref": "#/definitions/foo" }
      },
      "definitions": {
        "foo": { "type": "string" }
      }
    };

    it("should be true if a property matches and the schema validates", () => {
      expect(JsonSchema.validate(schema, { "foo": "bar" })).to.eql(true);
    });

    it("should not be true if a property matches and the schema is not valid", () => {
      expect(JsonSchema.validate(schema, { "foo": 6 })).to.eql(false);
    });

    it("should be true if for any property not in `properties`", () => {
      expect(JsonSchema.validate(schema, { "bar": 6 })).to.eql(true);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema, 6)).to.eql(true);
    });
  });
});
