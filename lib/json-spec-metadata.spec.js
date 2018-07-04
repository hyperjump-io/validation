import {  expect } from "chai";
import JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with a 'title'`, () => {
    const schema = JsonSpec("#", `{ "title": "foo" }`);
    const validate = JsonSpec.validate(schema);

    it("should be true for any value", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
