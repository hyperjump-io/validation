const expect = require("chai").expect;
const JsonSchema = require("./json-schema");
const loadTestSuite = require("json-schema-test-suite").loadSync;
const ValidationResult = require("./validation-result");


module.exports = (keyword, draft) => {
  const suites = loadTestSuite({
    filter: (file) => file === keyword + ".json" || file === "optional",
    draft: draft
  })[0];

  suites.schemas
    .filter((suite) => !("additionalProperties" in suite.schema))
    .filter((suite) => !suite.schema.type || !Array.isArray(suite.schema.type))
    .filter((suite) => !(suite.schema.not && suite.schema.not.type) || !Array.isArray(suite.schema.not.type))
    .filter((suite) => !suite.schema.items || !Array.isArray(suite.schema.items))
    .filter((suite) => !suite.schema["$ref"] || suite.schema["$ref"][0] === "#")
    .forEach((suite) => {
      const schema = JsonSchema("#", JSON.stringify(suite.schema));
      const validator = JsonSchema.validate(schema);
      describe(suite.description, () => {
        suite.tests.forEach((test) => {
          it(test.description, () => {
            const result = validator(test.data);
            expect(ValidationResult.isValid(result)).to.eql(test.valid);
          });
        });
      });
    });
};
