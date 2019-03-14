const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation =  require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid oneOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-oneOf-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": {}
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/oneOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-oneOf-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [{}, "foo"]
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/oneOf", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-oneOf";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [{ "type": "foo" }]
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/oneOf", false]]);
    });
  });

  describe("oneOf", () => {
    let validate;

    before(async () => {
      const url = "/oneOf";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [
          { "maximum": 2 },
          { "minimum": 4 }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("first oneOf valid", () => {
      const result = validate(1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("second oneOf valid", () => {
      const result = validate(5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("neither oneOf valid", () => {
      const result = validate(3);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("oneOf with base", () => {
    let validate;

    before(async () => {
      const url = "/oneOf-with-base";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "type": "string",
        "oneOf": [
          { "minLength": 2 },
          { "maxLength": 4 }
        ]
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("mismatch base", () => {
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
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "oneOf": [
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
});
