import { expect } from "chai";
import * as JsonSpec from "~/json-spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("an empty schema", () => {
    it("should be true for any value", () => {
      const schema = JsonSpec.load("#", `{}`);
      const result = JsonSpec.validate(schema)(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  jsonSchemaTestSuite("type", "draft4");
});
