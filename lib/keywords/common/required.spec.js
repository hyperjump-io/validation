const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid required value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-required-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "required": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/required", false]]);
    });

    it("should raise an error", async () => {
      const url = "/invalid-required-keyword-2";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "required": [3]
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
        .to.be.rejectedWith([["/properties", false]]);
    });
  });

  describe("required validation", () => {
    let validate;

    before(async () => {
      loadDoc("/required-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {},
          "bar": {}
        },
        "required": ["foo"]
      });
      const doc = Hyperjump.fetch(testDomain + "/required-validation");
      validate = await Validation.validate(doc);
    });

    it("present required property is valid", async () => {
      const result = await validate({ "foo": 1 });
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("non-present required property is invalid", async () => {
      const result = await validate({ "bar": 1 });
      expect(Validation.isValid(result)).to.eql(false);
    });

    it("ignores arrays", async () => {
      const result = await validate([]);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores strings", async () => {
      const result = await validate("");
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("ignores other non-objects", async () => {
      const result = await validate(12);
      expect(Validation.isValid(result)).to.eql(true);
    });
  });

  describe("required default validation", () => {
    let validate;

    before(async () => {
      loadDoc("/required-default-validation", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {}
        }
      });
      const doc = Hyperjump.fetch(testDomain + "/required-default-validation");
      validate = await Validation.validate(doc);
    });

    it("not required by default", async () => {
      const result = await validate({});
      expect(Validation.isValid(result)).to.eql(true);
    });
  });

  describe("required with empty array", () => {
    let validate;

    before(async () => {
      loadDoc("/required-with-empty-array", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": {}
        },
        "required": []
      });
      const doc = Hyperjump.fetch(testDomain + "/required-with-empty-array");
      validate = await Validation.validate(doc);
    });

    it("property not required", async () => {
      const result = await validate({});
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
