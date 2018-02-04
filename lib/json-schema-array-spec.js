const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with an `items` keyword', () => {
    const schema = JsonSchema("#", `{
      "items": { "type": "string" }
    }`);

    it("should be true if the data is not an array", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });

    it("should be true if the data has items that are all strings", () => {
      expect(JsonSchema.validate(schema)(["foo", "bar"])).to.eql(true);
    });

    it("should not be true if the data has an item that is not a string", () => {
      expect(JsonSchema.validate(schema)([6])).to.eql(false);
    });
  });

  describe('a schema with `"maxItems": 1`', () => {
    const schema = JsonSchema("#", `{ "maxItems": 1 }`);

    it("should be true if the data is not an array", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });

    it("should be true if the data has one or fewer items", () => {
      expect(JsonSchema.validate(schema)(["foo"])).to.eql(true);
    });

    it("should not be true if the data has more than one item", () => {
      expect(JsonSchema.validate(schema)(["foo", "bar"])).to.eql(false);
    });
  });

  describe('a schema with `"minItems": 1`', () => {
    const schema = JsonSchema("#", `{ "minItems": 1 }`);

    it("should be true if the data is not an array", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });

    it("should not be true if the data has fewer than one items", () => {
      expect(JsonSchema.validate(schema)([])).to.eql(false);
    });

    it("should be true if the data has one or more item", () => {
      expect(JsonSchema.validate(schema)(["foo"])).to.eql(true);
    });
  });

  describe('a schema with `"uniqueItems": true`', () => {
    const schema = JsonSchema("#", `{ "uniqueItems": true }`);

    it("should be true if the data is not an array", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });

    it("should not be true if the data has duplicate items", () => {
      expect(JsonSchema.validate(schema)(["foo", "foo"])).to.eql(false);
    });

    it("should be true if the data has no duplicate items", () => {
      expect(JsonSchema.validate(schema)(["foo", "bar"])).to.eql(true);
    });
  });
});
