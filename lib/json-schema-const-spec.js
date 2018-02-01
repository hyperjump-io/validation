const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with `"const": "foo"`', () => {
    const schema = JsonSchema("#", `{ "const": "foo" }`);

    it("should be true if the data is 'foo'", () => {
      expect(JsonSchema.validate(schema)("foo")).to.eql(true);
    });

    it("should not be true if the data is not 'foo'", () => {
      expect(JsonSchema.validate(schema)(6)).to.eql(false);
    });
  });

  describe('a schema with `"const": {}`', () => {
    const schema = JsonSchema("#", `{ "const": {} }`);

    it("should be true if the data is {}", () => {
      expect(JsonSchema.validate(schema)({})).to.eql(true);
    });
  });

  describe('a schema with `"const": { "foo": "bar", "bar": "foo" }`', () => {
    const schema = JsonSchema("#", `{ "const": { "foo": "bar", "bar": "foo" } }`);

    it("should be true if the data is {}", () => {
      expect(JsonSchema.validate(schema)({ "bar": "foo", "foo": "bar" })).to.eql(true);
    });
  });
});
