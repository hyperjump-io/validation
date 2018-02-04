const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with `properties` keyword', () => {
    const schema = JsonSchema("#", `{
      "properties": {
        "foo": { "type": "string" }
      }
    }`);

    it("should be true if a property matches and the schema validates", () => {
      expect(JsonSchema.validate(schema)({ "foo": "bar" })).to.eql(true);
    });

    it("should not be true if a property matches and the schema is not valid", () => {
      expect(JsonSchema.validate(schema)({ "foo": 6 })).to.eql(false);
    });

    it("should be true for any property not in `properties`", () => {
      expect(JsonSchema.validate(schema)({ "bar": 6 })).to.eql(true);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema)(6)).to.eql(true);
    });
  });

  describe('a schema with `patternProperties` keyword', () => {
    const schema = JsonSchema("#", `{
      "patternProperties": {
        "[aA]bc$": { "type": "string" }
      }
    }`);

    it("should be true if a property matches and the schema validates", () => {
      expect(JsonSchema.validate(schema)({ "abc": "foo" })).to.eql(true);
    });

    it("should not be true if a property matches and the schema is not valid", () => {
      expect(JsonSchema.validate(schema)({ "abc": 6 })).to.eql(false);
    });

    it("should be true for any property that doesn't match", () => {
      expect(JsonSchema.validate(schema)({ "bar": 6 })).to.eql(true);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema)(6)).to.eql(true);
    });
  });

  describe('a schema with `"maxProperties": 1`', () => {
    const schema = JsonSchema("#", `{ "maxProperties": 1 }`);

    it("should be true if there is only one property", () => {
      expect(JsonSchema.validate(schema)({ "foo": "bar" })).to.eql(true);
    });

    it("should not be true if there is more that one property", () => {
      expect(JsonSchema.validate(schema)({ "foo": "", "bar": "" })).to.eql(false);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });
  });

  describe('a schema with `"minProperties": 1`', () => {
    const schema = JsonSchema("#", `{ "minProperties": 1 }`);

    it("should be true if there is more that one property", () => {
      expect(JsonSchema.validate(schema)({ "foo": "", "bar": "" })).to.eql(true);
    });

    it("should not be true if there are less that one property", () => {
      expect(JsonSchema.validate(schema)({})).to.eql(false);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });
  });

  describe('a schema with `"required": ["foo"]`', () => {
    const schema = JsonSchema("#", `{ "required": ["foo"] }`);

    it("should be true if it contains a foo property", () => {
      expect(JsonSchema.validate(schema)({ "foo": "" })).to.eql(true);
    });

    it("should not be true if it doesn't conatin a foo property", () => {
      expect(JsonSchema.validate(schema)({ "bar": "" })).to.eql(false);
    });

    it("should be true if it is not an object", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });
  });

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
