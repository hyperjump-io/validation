const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const jsonSchemaTestSuite = require("./json-schema-test-suite");


describe("JSON Schema", () => {
  jsonSchemaTestSuite("allOf", "draft4");
  jsonSchemaTestSuite("anyOf", "draft4");
  jsonSchemaTestSuite("oneOf", "draft4");
  jsonSchemaTestSuite("not", "draft4");
});
