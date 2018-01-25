const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe("an empty schema", () => {
    it("should be true for any value", () => {
      const schema = JsonSchema("#", {});
      const result = JsonSchema.validate(schema, null);
      expect(result).to.eql(true);
    });
  });

  describe('a schema with a `"type": "object"`', () => {
    const schema = JsonSchema("#", { "type": "object" });

    it("should be true if the data is an object", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(true);
    });

    it("should not be true if the data is not an object", () => {
      expect(JsonSchema.validate(schema, 6)).to.eql(false);
    });
  });

  describe('a schema with a `"type": "null"`', () => {
    const schema = JsonSchema("#", { "type": "null" });

    it("should be true if the data is null", () => {
      expect(JsonSchema.validate(schema, null)).to.eql(true);
    });

    it("should not be true if the data is not null", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(false);
    });
  });

  describe('a schema with a `"type": "string"`', () => {
    const schema = JsonSchema("#", { "type": "string" });

    it("should be true if the data is a string", () => {
      expect(JsonSchema.validate(schema, "foo")).to.eql(true);
    });

    it("should not be true if the data is not a string", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(false);
    });
  });

  describe('a schema with a `"type": "array"`', () => {
    const schema = JsonSchema("#", { "type": "array" });

    it("should be true if the data is an array", () => {
      expect(JsonSchema.validate(schema, [])).to.eql(true);
    });

    it("should not be true if the data is not an array", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(false);
    });
  });

  describe('a schema with a `"type": "number"`', () => {
    const schema = JsonSchema("#", { "type": "number" });

    it("should be true if the data is a number", () => {
      expect(JsonSchema.validate(schema, 8.8)).to.eql(true);
    });

    it("should not be true if the data is not a number", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(false);
    });
  });

  describe('a schema with a `"type": "integer"`', () => {
    const schema = JsonSchema("#", { "type": "integer" });

    it("should be true if the data is an integer", () => {
      expect(JsonSchema.validate(schema, 8)).to.eql(true);
    });

    it("should not be true if the data is not an integer", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(false);
    });
  });
});
