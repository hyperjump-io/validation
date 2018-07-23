import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("an empty schema", () => {
    let validate;

    before(async () => {
      loadSchema("/type-1", {});
      const schema = await JsonSpec.get(testDomain + "/type-1");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true for any value", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  jsonSchemaTestSuite("type", "draft4");
});
