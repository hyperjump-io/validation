const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");


describe("JSON Schema", () => {
  //jsonSchemaTestSuite("maxLength", "draft4");
  //jsonSchemaTestSuite("minLength", "draft4");
  jsonSchemaTestSuite("pattern", "draft4");
  //jsonSchemaTestSuite("format", "draft4");
});
