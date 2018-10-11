import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Schema", () => {
  describe("an invalid properties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-properties-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-properties-keyword-2";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": 3
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });
  });

  describe("object properties validation", () => {
    let validate;

    before(async () => {
      loadSchema("/object-properties-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "number" },
          "bar": { "type": "string" }
        }
      });
      const schema = await JsonValidation.get(testDomain + "/object-properties-validation");
      validate = await JsonValidation.validate(schema);
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

  describe("an invalid required value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-required-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "required": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/required", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-required-keyword-2";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "required": [3]
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });
  });

  describe("required validation", () => {
    let validate;

    before(async () => {
      loadSchema("/required-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {},
          "bar": {}
        },
        "required": ["foo"]
      });
      const schema = await JsonValidation.get(testDomain + "/required-validation");
      validate = await JsonValidation.validate(schema);
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
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {}
        }
      });
      const schema = await JsonValidation.get(testDomain + "/required-default-validation");
      validate = await JsonValidation.validate(schema);
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
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {}
        },
        "required": []
      });
      const schema = await JsonValidation.get(testDomain + "/required-with-empty-array");
      validate = await JsonValidation.validate(schema);
    });

    it("property not required", () => {
      const result = validate({});
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid maxProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxProperties-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maxProperties": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/maxProperties", false]]);
    });
  });

  describe("maxProperties validation", () => {
    let validate;

    before(async () => {
      loadSchema("/maxProperties-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maxProperties": 2
      });
      const schema = await JsonValidation.get(testDomain + "/maxProperties-validation");
      validate = await JsonValidation.validate(schema);
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

  describe("an invalid minProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minProperties-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minProperties": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/minProperties", false]]);
    });
  });

  describe("minProperties validation", () => {
    let validate;

    before(async () => {
      loadSchema("/minProperties-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minProperties": 1
      });
      const schema = await JsonValidation.get(testDomain + "/minProperties-validation");
      validate = await JsonValidation.validate(schema);
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

  describe("an invalid patternProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-patternProperties-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-patternProperties-keyword-2";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "foo": 4
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });
  });

  describe("patternProperties validates properties matching a regex", () => {
    let validate;

    before(async () => {
      loadSchema("/patternProperties-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "f.*o": { "type": "number" }
        }
      });
      const schema = await JsonValidation.get(testDomain + "/patternProperties-validation");
      validate = await JsonValidation.validate(schema);
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
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "a*": { "type": "number" },
          "aaa*": { "maximum": 20 }
        }
      });
      const schema = await JsonValidation.get(testDomain + "/multiple-simultaneous-patternProperties");
      validate = await JsonValidation.validate(schema);
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
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "[0-9]{2,}": { "type": "boolean" },
          "X_": { "type": "string" }
        }
      });
      const schema = await JsonValidation.get(testDomain + "/regexes-not-anchored-and-not-case-sensitive");
      validate = await JsonValidation.validate(schema);
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

  describe("an invalid propertyNames value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-propertyNames-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "propertyNames": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/propertyNames", false]]);
    });
  });

  describe("propertyNames validation", () => {
    let validate;

    before(async () => {
      loadSchema("/propertyNames-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "propertyNames": { "maxLength": 3 }
      });
      const schema = await JsonValidation.get(testDomain + "/propertyNames-validation");
      validate = await JsonValidation.validate(schema);
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
