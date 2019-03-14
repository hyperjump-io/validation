const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid definitions value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-definitions-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/definitions", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-definitions-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": {
          "foo": 3
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/definitions", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-definitions";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": {
          "type": "foo"
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/definitions", false]]);
    });
  });

  describe("definitions validation", () => {
    let validate;

    before(async () => {
      const url = "/definitions-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": {
          "foo": { "type": "number" }
        }
      });
      const doc = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(doc);
    });

    it("definitions is always valid", () => {
      const result = validate(null);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
