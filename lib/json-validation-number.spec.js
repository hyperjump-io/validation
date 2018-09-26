import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


chaiUse(chaiAsPromised);

describe("JSON Schema", () => {
  describe("an invalid maximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-maximum-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maximum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/maximum", false]]);
    });
  });

  describe("maximum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/maximum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "maximum": 3.0
      });
      const schema = await JsonValidation.get(testDomain + "/maximum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("below the maximum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("above the maximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid exclusiveMaximum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-exclusiveMaximum-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "exclusiveMaximum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/exclusiveMaximum", false]]);
    });
  });

  describe("exclusiveMaximum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/exclusive-maximum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "exclusiveMaximum": 3.0
      });
      const schema = await JsonValidation.get(testDomain + "/exclusive-maximum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("below the exclusiveMaximum is valid", () => {
      const result = validate(2.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", () => {
      const result = validate(3.0);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("above the exclusiveMaximum is invalid", () => {
      const result = validate(3.5);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid minimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-minimum-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minimum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/minimum", false]]);
    });
  });

  describe("minimum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/minimum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "minimum": 1.1
      });
      const schema = await JsonValidation.get(testDomain + "/minimum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("above the minimum is valid", () => {
      const result = validate(2.6);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is valid", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("below the minimum is invalid", () => {
      const result = validate(0.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid exclusiveMinimum value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-exclusiveMinimum-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "exclusiveMinimum": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/exclusiveMinimum", false]]);
    });
  });

  describe("exclusiveMinimum validation", () => {
    let validate;

    before(async () => {
      loadSchema("/exclusive-minimum-validation", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "exclusiveMinimum": 1.1
      });
      const schema = await JsonValidation.get(testDomain + "/exclusive-minimum-validation");
      validate = await JsonValidation.validate(schema);
    });

    it("above the exclusiveMinimum is valid", () => {
      const result = validate(1.2);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("boundary point is invalid", () => {
      const result = validate(1.1);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("below the exclusiveMinimum is invalid", () => {
      const result = validate(0.6);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("x");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("an invalid multipleOf value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-multipleOf-keyword";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": true
      });
      const doc = await JsonValidation.get(testDomain + url);

      expect(JsonValidation.validate(doc))
        .to.be.rejectedWith([["/multipleOf", false]]);
    });
  });

  describe("multipleOf int", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-int";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": 2
      });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("by int", () => {
      const result = validate(10);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("by int fail", () => {
      const result = validate(7);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });

    it("ignores non-numbers", () => {
      const result = validate("foo");
      expect(ValidationResult.isValid(result)).to.eql(true);
    });
  });

  describe("multipleOf number", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-number";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": 1.5
      });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("zero is multiple of anything", () => {
      const result = validate(0);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("4.5 is multiple of 1.5", () => {
      const result = validate(4.5);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("35 is not multiple of 1.5", () => {
      const result = validate(35);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("multipleOf small number", () => {
    let validate;

    before(async () => {
      const url = "/multipleOf-small-number";
      loadSchema(url, {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
        "multipleOf": 0.0001
      });
      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("0.0075 is multiple of 0.0001", () => {
      const result = validate(0.0075);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("0.00751 is multiple of 0.0001", () => {
      const result = validate(0.00751);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
