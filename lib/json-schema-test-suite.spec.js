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
