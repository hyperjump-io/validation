import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  describe("root pointer ref", () => {
    let validate;

    before(async () => {
      const url = "/root-pointer-ref";
      loadSchema(url, {
        "properties": {
          "foo": { "$ref": "#" },
          "bar": { "type": "number" }
        }
      });
      const schema = await JsonSpec.get(testDomain + url);
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

    it("mismatch", () => {
      const result = validate({ "bar": false });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("recursive match", () => {
      const result = validate({ "foo": { "bar": false } });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("relative pointer ref to object", () => {
    let validate;

    before(async () => {
      const url = "/relative-pointer-ref-to-object";
      loadSchema(url, {
        "properties": {
          "foo": { "type": "number" },
          "bar": { "$ref": "#/properties/foo" }
        }
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("match", () => {
      const result = validate({ "bar": 3 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch", () => {
      const result = validate({ "bar": true });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("relative pointer ref to array", () => {
    let validate;

    before(async () => {
      const url = "/relative-pointer-ref-to-array";
      loadSchema(url, {
        "tupleItems": [
          { "type": "number" },
          { "$ref": "#/tupleItems/0" }
        ]
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("match array", () => {
      const result = validate([1, 2]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("mismatch array", () => {
      const result = validate([1, "foo"]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("escaped pointer ref", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-ref";
      loadSchema(url, {
        "tilda~field": { "type": "number" },
        "slash/field": { "type": "number" },
        "percent%field": { "type": "number" },
        "properties": {
          "tilda": { "$ref": "#/tilda~0field" },
          "slash": { "$ref": "#/slash~1field" },
          "percent": { "$ref": "#/percent%25field" }
        }
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("slash invalid", () => {
      const result = validate({ "slash": "aoeu" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("tilda invalid", () => {
      const result = validate({ "tilda": "aoeu" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("percent invalid", () => {
      const result = validate({ "percent": "aoeu" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("slash valid", () => {
      const result = validate({ "slash": 123 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("tilda valid", () => {
      const result = validate({ "tilda": 123 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("percent valid", () => {
      const result = validate({ "percent": 123 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("nested refs", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-ref";
      loadSchema(url, {
        "definitions": {
          "a": { "type": "number" },
          "b": { "$ref": "#/definitions/a" },
          "c": { "$ref": "#/definitions/b" }
        },
        "$ref": "#/definitions/c"
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("nested ref valid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("nested ref invalid", () => {
      const result = validate("a");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("nested refs", () => {
    let validate;

    before(async () => {
      const url = "/escaped-pointer-ref";
      loadSchema(url, {
        "definitions": {
          "reffed": { "type": "array" }
        },
        "properties": {
          "foo": {
            "$ref": "#/definitions/reffed",
            "maxItems": 2
          }
        }
      });
      const schema = await JsonSpec.get(testDomain + url);
      validate = await JsonSpec.validate(schema);
    });

    it("ref valid", () => {
      const result = validate({ "foo": [] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ref valid, maxItems ignored", () => {
      const result = validate({ "foo": [1, 2, 3] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ref invalid", () => {
      const result = validate({ "foo": "string" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("Recursive references between schemas", () => {
    let validate;

    before(async () => {
      loadSchema("/tree", {
        "description": "tree of nodes",
        "type": "object",
        "properties": {
          "meta": { "type": "string" },
          "nodes": {
            "type": "array",
            "items": { "$ref": "node" }
          }
        },
        "required": ["meta", "nodes"]
      });
      loadSchema("/node", {
        "description": "node",
        "type": "object",
        "properties": {
          "value": { "type": "number" },
          "subtree": { "$ref": "tree" }
        },
        "required": ["value"]
      });
      const schema = await JsonSpec.get(testDomain + "/tree");
      validate = await JsonSpec.validate(schema);
    });

    it("valid tree", () => {
      const result = validate({
        "meta": "root",
        "nodes": [
          {
            "value": 1,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": 1.1 },
                { "value": 1.2 }
              ]
            }
          },
          {
            "value": 2,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": 2.1 },
                { "value": 2.2 }
              ]
            }
          }
        ]
      });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("invalid tree", () => {
      const result = validate({
        "meta": "root",
        "nodes": [
          {
            "value": 1,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": "string is invalid" },
                { "value": 1.2 }
              ]
            }
          },
          {
            "value": 2,
            "subtree": {
              "meta": "child",
              "nodes": [
                { "value": 2.1 },
                { "value": 2.2 }
              ]
            }
          }
        ]
      });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
