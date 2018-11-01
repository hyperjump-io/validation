import {  expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadDoc, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";


chaiUse(chaiAsPromised);

describe("JSON Validation", () => {
  describe("a document with an undeclared keyword", () => {
    let doc;

    before(async () => {
      loadDoc("/metadata-1", {
        "$meta": { "$ref": "http://validation.hyperjump.io/common" },
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
