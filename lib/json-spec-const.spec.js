import { expect } from "chai";
import JsonSpec from "@/json-spec";
import * as ValidationResult from "@/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with '"const": "foo"'`, () => {
    const schema = JsonSpec("#", `{ "const": "foo" }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if the data is 'foo'", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if the data is not 'foo'", () => {
      const result = validate(6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe(`a schema with '"const": {}'`, () => {
    const schema = JsonSpec("#", `{ "const": {} }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if the data is {}", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with '"const": { "foo": "bar", "bar": "foo" }'`, () => {
    const schema = JsonSpec("#", `{ "const": { "foo": "bar", "bar": "foo" } }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if the data is {}", () => {
      const result = validate({ "bar": "foo", "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
