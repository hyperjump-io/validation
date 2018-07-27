import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe(`a schema with a '$ref'`, () => {
    let validate;

    before(async () => {
      loadSchema("/ref-1", {
        "properties": {
          "foo": { "$ref": "#/definitions/foo" }
        },
        "definitions": {
          "foo": { "type": "string" }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/ref-1");
      validate = await JsonSpec.validate(schema);
    });

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

  describe("root pointer ref", () => {
    let validate;

    before(async () => {
      loadSchema("/ref-2", {
        "properties": {
          "foo": { "$ref": "#" }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/ref-2");
      validate = await JsonSpec.validate(schema);
    });

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
