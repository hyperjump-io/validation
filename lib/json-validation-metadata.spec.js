import {  expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with a 'title'`, () => {
    let validate;

    before(async () => {
      loadSchema("/metadata-1", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "title": "foo"
      });
      const schema = await JsonValidation.get(testDomain + "/metadata-1");
      validate = await JsonValidation.validate(schema);
    });

    it("should be true for any value", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
