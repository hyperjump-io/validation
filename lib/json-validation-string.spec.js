import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Schema", () => {
  describe("an invalid maxLength value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maxLength-keyword";
      loadSchema(url, { "maxLength": "4" });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/maxLength", false]]);
    });
  });

  describe("maxLength validation", () => {
    let validate;

    before(async () => {
      const url = "/maxLength-validation";
      loadSchema(url, { "maxLength": 2 });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("shorter is valid", () => {
      const result = validate("f");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate("fo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too long is invalid", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", () => {
      const result = validate(100);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("length is determined by number of UTF-8 code points", () => {
      const result = validate("\uD83D\uDCA9"); // length == 4
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("an invalid minLength value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minLength-keyword";
      loadSchema(url, { "minLength": "4" });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/minLength", false]]);
    });
  });

  describe("minLength validation", () => {
    let validate;

    before(async () => {
      const url = "/minLength-validation";
      loadSchema(url, { "minLength": 2 });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("longer is valid", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("exact length is valid", () => {
      const result = validate("fo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("too short is invalid", () => {
      const result = validate("f");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", () => {
      const result = validate(100);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("length is determined by number of UTF-8 code points", () => {
      const result = validate("\uD83D\uDCA9"); // length == 4
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid pattern value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-pattern-keyword";
      loadSchema(url, { "pattern": 4 });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/pattern", false]]);
    });
  });

  describe("pattern validation", () => {
    let validate;

    before(async () => {
      const url = "/pattern-validation";
      loadSchema(url, { "pattern": "^a*$" });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("a matching pattern is valid", () => {
      const result = validate("aaa");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("a non-matching pattern is invalid", () => {
      const result = validate("abc");
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-strings", () => {
      const result = validate(true);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("pattern is not anchored", () => {
    let validate;

    before(async () => {
      const url = "/pattern-is-not-anchored";
      loadSchema(url, { "pattern": "a+" });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("matches a substring", () => {
      const result = validate("xxaayy");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });
});
