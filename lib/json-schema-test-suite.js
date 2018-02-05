const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const loadTestSuite = require("json-schema-test-suite").loadSync;


module.exports = (keyword, draft) => {
  const suites = loadTestSuite({
    filter: (file) => file === keyword + ".json" || file === "optional",
    draft: draft
  })[0];

  suites.schemas
    .filter((suite) => !suite.schema.additionalProperties)
    .filter((suite) => !suite.schema.type || !Array.isArray(suite.schema.type))
    .filter((suite) => !suite.schema.items || !Array.isArray(suite.schema.items))
    .forEach((suite) => {
      const schema = JsonSchema("#", JSON.stringify(suite.schema));
      describe(suite.description, () => {
        suite.tests.forEach((test) => {
          it(test.description, () => {
            expect(JsonSchema.validate(schema)(test.data)).to.eql(test.valid);
          });
        });
      });
    });
};
