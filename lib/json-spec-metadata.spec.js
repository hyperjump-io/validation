import {  expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with a 'title'`, () => {
    let validate;

    before(async () => {
      loadSchema("/metadata-1", { "title": "foo" });
      const schema = await JsonSpec.get(testDomain + "/metadata-1");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true for any value", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
