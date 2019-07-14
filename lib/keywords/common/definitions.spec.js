const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../../test-utils.spec");
const Hyperjump = require("@hyperjump/browser");
const HVal = require("../..");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("an invalid definitions value", () => {
    it("should raise an error", async () => {
      const url = "/invalid-definitions-keyword";
      loadDoc(url, {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "definitions": true
      });
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
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
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
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
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);

      await expect(HVal.validate(doc))
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
      const doc = await Hyperjump.get(testDomain + url, Hyperjump.nil);
      validate = await HVal.validate(doc);
    });

    it("definitions is always valid", async () => {
      const result = await validate(null);
      expect(HVal.isValid(result)).to.eql(true);
    });
  });
});
