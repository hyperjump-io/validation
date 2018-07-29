import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("allOf", () => {
    let validate;

    before(async () => {
      const url = "/allOf";
      loadSchema(url, {
        "allOf": [
          {
            "properties": {
              "bar": { "type": "integer" }
            },
            "required": ["bar"]
          },
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("allOf", () => {
      const result = validate({ "foo": "baz", "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch second", () => {
      const result = validate({ "foo": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("mismatch first", () => {
      const result = validate({ "bar": "quux" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("wrong type", () => {
      const result = validate({ "foo": "baz", "baz": "quux" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("allOf with base schema", () => {
    let validate;

    before(async () => {
      const url = "/allOf-with-base-schema";
      loadSchema(url, {
        "properties": { "bar": { "type": "integer" } },
        "required": ["bar"],
        "allOf": [
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          },
          {
            "properties": {
              "baz": { "type": "null" }
            },
            "required": ["baz"]
          }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("valid", () => {
      const result = validate({ "foo": "quux", "bar": 2, "baz": null });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch base schema", () => {
      const result = validate({ "foo": "quux", "baz": null });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("mismatch first allOf", () => {
      const result = validate({ "bar": 2, "baz": null });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("mismatch second allOf", () => {
      const result = validate({ "foo": "quux", "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("mismatch both", () => {
      const result = validate({ "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("allOf simple types", () => {
    let validate;

    before(async () => {
      const url = "/allOf-simple-types";
      loadSchema(url, {
        "allOf": [
          { "maximum": 30 },
          { "minimum": 20 }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("valid", () => {
      const result = validate(25);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch one", () => {
      const result = validate(35);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("anyOf", () => {
    let validate;

    before(async () => {
      const url = "/anyOf";
      loadSchema(url, {
        "anyOf": [
          { "type": "integer" },
          { "minimum": 2 }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("first anyOf valid", () => {
      const result = validate(1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("second anyOf valid", () => {
      const result = validate(2.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("both anyOf valid", () => {
      const result = validate(3);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("neither anyOf valid", () => {
      const result = validate(1.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("anyOf with base schema", () => {
    let validate;

    before(async () => {
      const url = "/anyOf-with-base-schema";
      loadSchema(url, {
        "type": "string",
        "anyOf": [
          { "maxLength": 2 },
          { "minLength": 4 }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("one anyOf valid", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("both anyOf invalid", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("anyOf complex types", () => {
    let validate;

    before(async () => {
      const url = "/anyOf-complex-types";
      loadSchema(url, {
        "anyOf": [
          {
            "properties": {
              "bar": { "type": "integer" }
            },
            "required": ["bar"]
          },
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("first anyOf valid (complex)", () => {
      const result = validate({ "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("second anyOf invalid (complex)", () => {
      const result = validate({ "foo": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("both anyOf invalid (complex)", () => {
      const result = validate({ "foo": "baz", "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("neither anyOf invalid (complex)", () => {
      const result = validate({ "foo": 2, "bar": "quux" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("oneOf", () => {
    let validate;

    before(async () => {
      const url = "/oneOf";
      loadSchema(url, {
        "oneOf": [
          { "type": "integer" },
          { "minimum": 2 }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("first oneOf valid", () => {
      const result = validate(1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("second oneOf valid", () => {
      const result = validate(2.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("neither oneOf valid", () => {
      const result = validate(1.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("oneOf with base schema", () => {
    let validate;

    before(async () => {
      const url = "/oneOf-with-base-schema";
      loadSchema(url, {
        "type": "string",
        "oneOf": [
          { "minLength": 2 },
          { "maxLength": 4 }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("mismatch base schema", () => {
      const result = validate(3);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("one oneOf valid", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("both oneOf valid", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("oneOf complex types", () => {
    let validate;

    before(async () => {
      const url = "/oneOf-complex-types";
      loadSchema(url, {
        "oneOf": [
          {
            "properties": {
              "bar": { "type": "integer" }
            },
            "required": ["bar"]
          },
          {
            "properties": {
              "foo": { "type": "string" }
            },
            "required": ["foo"]
          }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("first oneOf valid (complex)", () => {
      const result = validate({ "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("second oneOf valid (complex)", () => {
      const result = validate({ "foo": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("both oneOf valid (complex)", () => {
      const result = validate({ "foo": "baz", "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("neither oneOf valid (complex)", () => {
      const result = validate({ "foo": 2, "bar": "quux" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

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
