const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with a `title`', () => {
    const schema = JsonSchema("#", { "title": "foo" });

    it("should be true for any value", () => {
      expect(JsonSchema.validate(schema, "foo")).to.eql(true);
    });
  });
});
