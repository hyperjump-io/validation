const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");
const ValidationResult = require("./validation-result");


describe("JSON Schema", () => {
  describe("an empty schema", () => {
    it("should be true for any value", () => {
      const schema = JsonSchema("#", `{}`);
      const result = JsonSchema.validate(schema)(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  jsonSchemaTestSuite("type", "draft4");
});
