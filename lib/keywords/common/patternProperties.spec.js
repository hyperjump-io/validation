const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const JVal = require("../..");
const ValidationResult = require("../../validation-result");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid patternProperties value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-patternProperties-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "patternProperties": true
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-patternProperties-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "foo": 4
        }
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-patternProperties";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "": { "type": "foo" }
        }
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(JVal.validate(doc))
        .to.be.rejectedWith([["/patternProperties", false]]);
    });
  });

  describe("patternProperties validates properties matching a regex", () => {
    let validate;

    before(async () => {
      loadDoc("/patternProperties-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "f.*o": { "type": "number" }
        }
      });
      const doc = await Hyperjump.get(testDomain + "/patternProperties-validation", Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("a single valid match is valid", async () => {
      const result = await validate({ "foo": 1 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("multiple valid matches is valid", async () => {
      const result = await validate({ "foo": 1, "foooooo": 2 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a single invalid match is invalid", async () => {
      const result = await validate({ "foo": "bar", "foooooo": 2 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("multiple invalid matches is invalid", async () => {
      const result = await validate({ "foo": "bar", "foooooo": "baz" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores arrays", async () => {
      const result = await validate(["foo"]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("multiple simultaneous patternProperties are validated", () => {
    let validate;

    before(async () => {
      loadDoc("/multiple-simultaneous-patternProperties", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "a*": { "type": "number" },
          "aaa*": { "maximum": 20 }
        }
      });
      const doc = await Hyperjump.get(testDomain + "/multiple-simultaneous-patternProperties", Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("a single valid match is valid", async () => {
      const result = await validate({ "a": 21 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a simultaneous match is valid", async () => {
      const result = await validate({ "aaaa": 18 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("multiple matches is valid", async () => {
      const result = await validate({ "a": 21, "aaaa": 18 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("an invalid due to one is invalid", async () => {
      const result = await validate({ "a": "bar" });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an invalid due to the other is invalid", async () => {
      const result = await validate({ "aaaa": 31 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("an invalid due to both is invalid", async () => {
      const result = await validate({ "aaa": "foo", "aaaa": 31 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("regexes are not anchored by default and are case sensitive", () => {
    let validate;

    before(async () => {
      loadDoc("/regexes-not-anchored-and-not-case-sensitive", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "patternProperties": {
          "[0-9]{2,}": { "type": "boolean" },
          "X_": { "type": "string" }
        }
      });
      const doc = await Hyperjump.get(testDomain + "/regexes-not-anchored-and-not-case-sensitive", Hyperjump.nil);
      validate = await JVal.validate(doc);
    });

    it("non recognized members are ignored", async () => {
      const result = await validate({ "answer 1": "42" });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("recognized members are accounted for", async () => {
      const result = await validate({ "a31b": null });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("regexes are case sensitive", async () => {
      const result = await validate({ "a_x_3": 3 });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("regexes are case sensitive, 2", async () => {
      const result = await validate({ "a_X_3": 3 });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
