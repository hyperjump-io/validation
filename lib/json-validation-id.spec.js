import { expect } from "chai";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonValidation from "~/json-validation";
import * as ValidationResult from "~/validation-result";


describe("JSON Schema", () => {
  before(async () => {
    loadSchema("/folder/folder-number", { "type": "number" });

    loadSchema("/folder/index", {
      "type": "array",
      "items": { "$ref": "folder-number" }
    });
  });

  describe("base URI change", () => {
    let validate;

    before(async () => {
      const url = "/base-uri-change";
      loadSchema(url, {
        "items": {
          "$id": testDomain + "/folder/index",
          "items": { "$ref": "folder-number" }
        }
      });

      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("base URI change ref invalid", () => {
      const result = validate([[1]]);
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("base URI change - change folder", () => {
      const result = validate([["a"]]);
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });

  describe("base URI change - change folder", () => {
    let validate;

    before(async () => {

      const url = "/base-uri-change-2";
      loadSchema(url, {
        "type": "object",
        "properties": {
          "list": { "$ref": "#/definitions/baz" }
        },
        "definitions": {
          "baz": {
            "$id": testDomain + "/folder/index",
            "type": "array",
            "items": { "$ref": "folder-number" }
          }
        }
      });

      const schema = await JsonValidation.get(testDomain + url);
      validate = await JsonValidation.validate(schema);
    });

    it("number is valid", () => {
      const result = validate({ "list": [1] });
      expect(ValidationResult.isValid(result)).to.eql(true);
    });

    it("string is invalid", () => {
      const result = validate({ "list": ["a"] });
      expect(ValidationResult.isValid(result)).to.eql(false);
    });
  });
});
