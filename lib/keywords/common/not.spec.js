const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid not value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-not-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": "foo"
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/not", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-not";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": { "type": "foo" }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/not", false]]);
    });
  });

  describe("not", () => {
    let validate;

    before(async () => {
      const url = "/not";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": { "type": "number" }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
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

  describe("not more complex", () => {
    let validate;

    before(async () => {
      const url = "/not-more-complex";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "not": {
          "type": "object",
          "properties": {
            "foo": { "type": "string" }
          }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
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
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "not": {} }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
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
