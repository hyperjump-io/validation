const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require("../..");


use(chaiAsPromised);

describe("Hyperjump Validation", () => {
  describe("an invalid definitions value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-definitions-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": true
      });
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
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
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
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
      const doc = Hyperjump.fetch(testDomain + url);

      await expect(Validation.validate(doc))
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
      const doc = Hyperjump.fetch(testDomain + url);
      validate = await Validation.validate(doc);
    });

    it("definitions is always valid", async () => {
      const result = await validate(null);
      expect(Validation.isValid(result)).to.eql(true);
    });
  });
});
