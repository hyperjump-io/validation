import jsonSchemaTestSuite from "@/json-schema-test-suite.spec";


describe("JSON Schema", () => {
  //jsonSchemaTestSuite("maxLength", "draft4");
  //jsonSchemaTestSuite("minLength", "draft4");
  jsonSchemaTestSuite("pattern", "draft4");
  //jsonSchemaTestSuite("format", "draft4");
});
