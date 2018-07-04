import jsonSchemaTestSuite from "~/json-schema-test-suite.spec";


describe("JSON Schema", () => {
  jsonSchemaTestSuite("allOf", "draft4");
  jsonSchemaTestSuite("anyOf", "draft4");
  jsonSchemaTestSuite("oneOf", "draft4");
  jsonSchemaTestSuite("not", "draft4");
});
