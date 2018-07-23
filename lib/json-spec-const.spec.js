import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with '"const": "foo"'`, () => {
    let validate;

    before(async () => {
      loadSchema("/const-1", { "const": "foo" });
      const schema = await JsonSpec.get(testDomain + "/const-1");
      validate = await JsonSpec.validate(schema);
    });

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
    let validate;

    before(async () => {
      loadSchema("/const-2", { "const": {} });
      const schema = await JsonSpec.get(testDomain + "/const-2");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true if the data is {}", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe(`a schema with '"const": { "foo": "bar", "bar": "foo" }'`, () => {
    let validate;

    before(async () => {
      loadSchema("/const-3", { "const": { "foo": "bar", "bar": "foo" } });
      const schema = await JsonSpec.get(testDomain + "/const-3");
      validate = await JsonSpec.validate(schema);
    });

    it("should be true if the data is {}", () => {
      const result = validate({ "bar": "foo", "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
