import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid anyOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-anyOf-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "anyOf": {}
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/allOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-anyOf-keyword-2";
      loadDoc(url, { "anyOf": [{}, "foo"] });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/anyOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-anyOf";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "anyOf": [{ "type": "foo" }]
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/anyOf", false]]);
    });
  });

  describe("anyOf", () => {
    let validate;

    before(async () => {
      const url = "/anyOf";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "anyOf": [
          { "minimum": 4 },
          { "multipleOf": 2 }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("first anyOf valid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("second anyOf valid", () => {
      const result = validate(2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("both anyOf valid", () => {
      const result = validate(6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("neither anyOf valid", () => {
      const result = validate(3);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("anyOf with base", () => {
    let validate;

    before(async () => {
      const url = "/anyOf-with-base";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "type": "string",
        "anyOf": [
          { "maxLength": 2 },
          { "minLength": 4 }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
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
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "anyOf": [
          {
            "properties": {
              "bar": { "type": "number" }
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
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
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
});
