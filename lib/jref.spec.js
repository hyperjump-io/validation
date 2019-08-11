const { expect } = require("chai");
const { loadDoc, testDomain } = require("./test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require(".");


describe("Hyperjump Validation", () => {
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("valid document", async () => {
      loadDoc("/valid-foo-number", {
        "foo": 2
      });
      const subject = Hyperjump.fetch(`${testDomain}/valid-foo-number`);
      const result = await validate(subject);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("invalid document", async () => {
      loadDoc("/invalid-foo-number", {
        "foo": "2"
      });
      const subject = Hyperjump.fetch(`${testDomain}/invalid-foo-number`);
      const result = await validate(subject);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });

  describe("const JRef document", () => {
    let validate;

    before(async () => {
      const url = "/jref-const";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "const": { "foo": "bar" }
      });
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("valid document", async () => {
      loadDoc("/valid-const", {
        "foo": "bar"
      });
      const subject = Hyperjump.fetch(`${testDomain}/valid-const`);
      const result = await validate(subject);
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("invalid document", async () => {
      loadDoc("/invalid-const", {
        "foo": "2"
      });
      const subject = Hyperjump.fetch(`${testDomain}/invalid-const`);
      const result = await validate(subject);
      expect(Validation.isValid(result)).to.eql(false);
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
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
      expect(Validation.isValid(result)).to.eql(true);
    });

    it("invalid document", async () => {
      loadDoc("/invalid-validation-doc", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "properties": {
          "foo": { "$href": "#" },
          "bar": { "type": "function" }
        }
      });
      const subject = Hyperjump.fetch(`${testDomain}/invalid-validation-doc`);
      const result = await validate(subject);
      expect(Validation.isValid(result)).to.eql(false);
    });
  });
});
