const { expect } = require("chai");
const { loadDoc, testDomain } = require("./test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require(".");


describe("JSON Validation", () => {
  describe("simple JRef document", () => {
    let validate;

    before(async () => {
      const url = "/jref-foo-number";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "type": "number" }
        }
      });
      const doc = HVal.get(testDomain + url, HVal.nil);
      validate = await HVal.validate(doc);
    });

    it("valid document", async () => {
      loadDoc("/valid-foo-number", {
        "foo": 2
      });
      const subject = Hyperjump.get(`${testDomain}/valid-foo-number`, Hyperjump.nil);
      const result = await validate(subject);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("invalid document", async () => {
      loadDoc("/invalid-foo-number", {
        "foo": "2"
      });
      const subject = Hyperjump.get(`${testDomain}/invalid-foo-number`, Hyperjump.nil);
      const result = await validate(subject);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });

  describe("recursive JRef document", () => {
    let validate;

    before(async () => {
      const url = "/jref-validation";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "validation": true
      });
      const doc = Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("valid document", async () => {
      loadDoc("/valid-validation-doc", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "$href": "#" }
        }
      });
      const subject = Hyperjump.get(`${testDomain}/valid-validation-doc`, Hyperjump.nil);
      const result = await validate(subject);
      expect(HVal.isValid(result)).to.eql(true);
    });

    it("invalid document", async () => {
      loadDoc("/invalid-validation-doc", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "$href": "#" },
          "bar": { "type": "function" }
        }
      });
      const subject = Hyperjump.get(`${testDomain}/invalid-validation-doc`, Hyperjump.nil);
      const result = await validate(subject);
      expect(HVal.isValid(result)).to.eql(false);
    });
  });
});
