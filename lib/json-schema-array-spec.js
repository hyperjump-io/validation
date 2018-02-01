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
});
