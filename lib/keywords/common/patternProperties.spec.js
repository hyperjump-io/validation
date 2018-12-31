const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const JsonValidation = require("../../json-validation");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid patternProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-patternProperties-keyword";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-patternProperties-keyword-2";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "foo": 4
        }
      });
      const doc = await JsonValidation.get(testDomain + url);

      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-patternProperties";
      loadDoc(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "": { "type": "foo" }
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
      loadDoc("/patternProperties-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "f.*o": { "type": "number" }
        }
      });
      const doc = await JsonValidation.get(testDomain + "/patternProperties-validation");
      validate = await JsonValidation.validate(doc);
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
      loadDoc("/multiple-simultaneous-patternProperties", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "a*": { "type": "number" },
          "aaa*": { "maximum": 20 }
        }
      });
      const doc = await JsonValidation.get(testDomain + "/multiple-simultaneous-patternProperties");
      validate = await JsonValidation.validate(doc);
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
      loadDoc("/regexes-not-anchored-and-not-case-sensitive", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "[0-9]{2,}": { "type": "boolean" },
          "X_": { "type": "string" }
        }
      });
      const doc = await JsonValidation.get(testDomain + "/regexes-not-anchored-and-not-case-sensitive");
      validate = await JsonValidation.validate(doc);
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
});
