const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with `"const": "foo"`', () => {
    const schema = JsonSchema("#", `{ "const": "foo" }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the data is 'foo'", () => {
      expect(validate("foo")).to.eql(true);
    });

    it("should not be true if the data is not 'foo'", () => {
      expect(validate(6)).to.eql(false);
    });
  });

  describe('a schema with `"const": {}`', () => {
    const schema = JsonSchema("#", `{ "const": {} }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the data is {}", () => {
      expect(validate({})).to.eql(true);
    });
  });

  describe('a schema with `"const": { "foo": "bar", "bar": "foo" }`', () => {
    const schema = JsonSchema("#", `{ "const": { "foo": "bar", "bar": "foo" } }`);
    const validate = JsonSchema.validate(schema);

    it("should be true if the data is {}", () => {
      expect(validate({ "bar": "foo", "foo": "bar" })).to.eql(true);
    });
  });
});
