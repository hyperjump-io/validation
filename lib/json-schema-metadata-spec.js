const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with a `title`', () => {
    const schema = JsonSchema("#", `{ "title": "foo" }`);
    const validate = JsonSchema.validate(schema);

    it("should be true for any value", () => {
      expect(validate("foo")).to.eql(true);
    });
  });
});
