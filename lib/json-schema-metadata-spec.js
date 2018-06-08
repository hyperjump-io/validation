const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const ValidationResult = require("./validation-result");


describe("JSON Schema", () => {
  describe('a schema with a `title`', () => {
    const schema = JsonSchema("#", `{ "title": "foo" }`);
    const validate = JsonSchema.validate(schema);

    it("should be true for any value", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
