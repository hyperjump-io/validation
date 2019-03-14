const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadDoc, testDomain } = require("../test-utils.spec");
const JsonValidation = require("../json-validation");


use(chaiAsPromised);

describe("JSON Validation", () => {
  describe("a document with an undeclared keyword", () => {
    let doc;

    before(async () => {
      loadDoc("/metadata-1", {
        "$meta": { "$href": "http://validation.hyperjump.io/common" },
        "title": "foo"
      });
      doc = await JsonValidation.get(testDomain + "/metadata-1");
    });

    it("should be true for any value", async () => {
      await expect(JsonValidation.validate(doc))
        .to.be.rejectedWith(Error, `Encountered undeclared keyword 'title' at '${testDomain}/metadata-1#/title'`);
    });
  });
});
