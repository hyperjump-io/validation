import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  jsonSchemaTestSuite("allOf", "draft4");
  jsonSchemaTestSuite("anyOf", "draft4");
  jsonSchemaTestSuite("oneOf", "draft4");

  describe("not", () => {
    let validate;

    before(async () => {
      const url = "/not";
      loadSchema(url, { "not": { "type": "integer" } });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("allowed", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("disallowed", () => {
      const result = validate(1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("not more complex schema", () => {
    let validate;

    before(async () => {
      const url = "/not-more-complex-schema";
      loadSchema(url, {
        "not": {
          "type": "object",
          "properties": {
            "foo": { "type": "string" }
          }
        }
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("match", () => {
      const result = validate(1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("other match", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch", () => {
      const result = validate({ "foo": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("forbidden property", () => {
    let validate;

    before(async () => {
      const url = "/forbidden-property";
      loadSchema(url, {
        "properties": {
          "foo": { "not": {} }
        }
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("property present", () => {
      const result = validate({ "foo": 1, "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("property absent", () => {
      const result = validate({ "bar": 1, "baz": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
