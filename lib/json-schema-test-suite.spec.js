import { expect } from "chai";
import { loadSync as loadTestSuite } from "json-schema-test-suite";
import { loadSchema, testDomain } from "~/test-utils.spec";
import * as JsonSpec from "~/json-spec";
import * as ValidationResult from "~/validation-result";


export default (keyword, draft) => {
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
      describe(suite.description, () => {
        let validate;

        before(async () => {
          const url = "/" + suite.description.replace(/ /g, "-");
          loadSchema(url, suite.schema);
          const schema = await JsonSpec.get(testDomain + url);
          validate = await JsonSpec.validate(schema);
        });

        suite.tests.forEach((test) => {
          it(test.description, () => {
            const result = validate(test.data);
            expect(ValidationResult.isValid(result)).to.eql(test.valid);
          });
        });
      });
    });
};
