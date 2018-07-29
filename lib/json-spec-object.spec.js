import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("object properties validation", () => {
    let validate;

    before(async () => {
      loadSchema("/object-properties-validation", {
        "properties": {
          "foo": { "type": "integer" },
          "bar": { "type": "string" }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/object-properties-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("both properties present and valid is valid", () => {
      const result = validate({ "foo": 1, "bar": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("one property present invalid is invalid", () => {
      const result = validate({ "foo": 1, "bar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("both property invalid is invalid", () => {
      const result = validate({ "foo": [], "bar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("doesn't invalidate other properties", () => {
      const result = validate({ "quux": [] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("properties, patternProperties interaction", () => {
    let validate;

    before(async () => {
      loadSchema("/properties-patternProperties-interaction", {
        "properties": {
          "foo": { "type": "array", "maxItems": 3 },
          "bar": { "type": "string" }
        },
        "patternProperties": {
          "f.o": { "minItems": 2 }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/properties-patternProperties-interaction");
      validate = await JsonSpec.validate(schema);
    });

    it("property validates property", () => {
      const result = validate({ "foo": [1, 2] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("property invalidates property", () => {
      const result = validate({ "foo": [1, 2, 3, 4] });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("patternProperty invalidates property", () => {
      const result = validate({ "foo": [] });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("patternProperty validates nonproperty", () => {
      const result = validate({ "fxo": [1, 2] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("patternProperty invalidates nonproperty", () => {
      const result = validate({ "fxo": [] });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("required validation", () => {
    let validate;

    before(async () => {
      loadSchema("/required-validation", {
        "properties": {
          "foo": {},
          "bar": {}
        },
        "required": ["foo"]
      });
      const schema = await JsonSpec.get(testDomain + "/required-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("present required property is valid", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("non-present required property is invalid", () => {
      const result = validate({ "bar": 1 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores strings", () => {
      const result = validate("");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("required default validation", () => {
    let validate;

    before(async () => {
      loadSchema("/required-default-validation", {
        "properties": {
          "foo": {}
        }
      });
      const schema = await JsonSpec.get(testDomain + "/required-default-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("not required by default", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("required with empty array", () => {
    let validate;

    before(async () => {
      loadSchema("/required-with-empty-array", {
        "properties": {
          "foo": {}
        },
        "required": []
      });
      const schema = await JsonSpec.get(testDomain + "/required-with-empty-array");
      validate = await JsonSpec.validate(schema);
    });

    it("property not required", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("maxProperties validation", () => {
    let validate;

    before(async () => {
      loadSchema("/maxProperties-validation", { "maxProperties": 2 });
      const schema = await JsonSpec.get(testDomain + "/maxProperties-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("shorter is valid", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate({ "foo": 1, "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too long is invalid", () => {
      const result = validate({ "foo": 1, "bar": 2, "baz": 3 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores strings", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("minProperties validation", () => {
    let validate;

    before(async () => {
      loadSchema("/minProperties-validation", { "minProperties": 1 });
      const schema = await JsonSpec.get(testDomain + "/minProperties-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("longer is valid", () => {
      const result = validate({ "foo": 1, "bar": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too short is invalid", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", () => {
      const result = validate([]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores strings", () => {
      const result = validate("");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("patternProperties validates properties matching a regex", () => {
    let validate;

    before(async () => {
      loadSchema("/patternProperties-validation", {
        "patternProperties": {
          "f.*o": { "type": "integer" }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/patternProperties-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("a single valid match is valid", () => {
      const result = validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("multiple valid matches is valid", () => {
      const result = validate({ "foo": 1, "foooooo": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a single invalid match is invalid", () => {
      const result = validate({ "foo": "bar", "foooooo": 2 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("multiple invalid matches is invalid", () => {
      const result = validate({ "foo": "bar", "foooooo": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", () => {
      const result = validate(["foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("multiple simultaneous patternProperties are validated", () => {
    let validate;

    before(async () => {
      loadSchema("/multiple-simultaneous-patternProperties", {
        "patternProperties": {
          "a*": { "type": "integer" },
          "aaa*": { "maximum": 20 }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/multiple-simultaneous-patternProperties");
      validate = await JsonSpec.validate(schema);
    });

    it("a single valid match is valid", () => {
      const result = validate({ "a": 21 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a simultaneous match is valid", () => {
      const result = validate({ "aaaa": 18 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("multiple matches is valid", () => {
      const result = validate({ "a": 21, "aaaa": 18 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("an invalid due to one is invalid", () => {
      const result = validate({ "a": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an invalid due to the other is invalid", () => {
      const result = validate({ "aaaa": 31 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an invalid due to both is invalid", () => {
      const result = validate({ "aaa": "foo", "aaaa": 31 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("regexes are not anchored by default and are case sensitive", () => {
    let validate;

    before(async () => {
      loadSchema("/regexes-not-anchored-and-not-case-sensitive", {
        "patternProperties": {
          "[0-9]{2,}": { "type": "boolean" },
          "X_": { "type": "string" }
        }
      });
      const schema = await JsonSpec.get(testDomain + "/regexes-not-anchored-and-not-case-sensitive");
      validate = await JsonSpec.validate(schema);
    });

    it("non recognized members are ignored", () => {
      const result = validate({ "answer 1": "42" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("recognized members are accounted for", () => {
      const result = validate({ "a31b": null });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("regexes are case sensitive", () => {
      const result = validate({ "a_x_3": 3 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("regexes are case sensitive, 2", () => {
      const result = validate({ "a_X_3": 3 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("propertyNames validation", () => {
    let validate;

    before(async () => {
      loadSchema("/propertyNames-validation", {
        "propertyNames": { "maxLength": 3 }
      });
      const schema = await JsonSpec.get(testDomain + "/propertyNames-validation");
      validate = await JsonSpec.validate(schema);
    });

    it("all property names valid", () => {
      const result = validate({ "f": {}, "foo": {} });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("some property names invalid", () => {
      const result = validate({ "foo": {}, "foobar": {} });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("object without properties is valid", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores arrays", () => {
      const result = validate([1, 2, 3, 4]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores string", () => {
      const result = validate("foobar");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", () => {
      const result = validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
