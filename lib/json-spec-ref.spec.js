import { expect } from "chai";
import * as JsonSpec from "~/json-spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with a '$ref'`, () => {
    const schema = JsonSpec.load("#", `{
      "properties": {
        "foo": { "$ref": "#/definitions/foo" }
      },
      "definitions": {
        "foo": { "type": "string" }
      }
    }`);
    const validate = JsonSpec.validate(schema);

    it("should be true if a property matches and the schema validates", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should not be true if a property matches and the schema is not valid", () => {
      const result = validate({ "foo": 6 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("should be true if for any property not in `properties`", () => {
      const result = validate({ "bar": 6 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("should be true if it is not an object", () => {
      const result = validate(6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  jsonSchemaTestSuite("ref", "draft4");

  describe("root pointer ref", () => {
    const schema = JsonSpec.load("#", `{
      "properties": {
        "foo": { "$ref": "#" }
      }
    }`);
    const validate = JsonSpec.validate(schema);

    it("match", () => {
      const result = validate({ "foo": false });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("recursive match", () => {
      const result = validate({ "foo": { "foo": false } });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
