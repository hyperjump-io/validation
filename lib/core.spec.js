const { expect } = require("chai");
const { loadDoc, testDomain } = require("./test-utils.spec");
const { Given, When, And, Then } = require("./mocha-gherkin.spec");
const Hyperjump = require("@hyperjump/browser");
const Validation = require(".");


const validationDomain = "https://validation.hyperjump.io";

Given("no keywords", () => {
  const url = "/empty";
  let hval;

  before(() => {
    loadDoc(url, {});
    hval = Hyperjump.fetch(`${testDomain}${url}`);
  });

  When("the document is meta validated", () => {
    let metaResult;

    before(async () => {
      const meta = await Validation.metaCompile(hval, {});
      metaResult = await Validation.metaInterpret(meta, hval, new Set());
    });

    Then("the result should be valid", async () => {
      expect(Validation.isValid(metaResult)).to.equal(true);
    });
  });

  When("the document is compiled", () => {
    let ast;

    before(async () => {
      ast = await Validation.compile(hval, {});
    });

    Then("the ast should be empty", () => {
      expect(ast).to.eql({ [`${testDomain}${url}`]: [] });
    });

    And("the ast is interpreted with a valid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/valid`, 42);
        const subject = Hyperjump.fetch(`${testDomain}${url}/valid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should be valid", () => {
        expect(Validation.isValid(result)).to.equal(true);
      });
    });
  });
});

Given("a simple constraint", () => {
  const url = "/simple";
  let hval;

  before(() => {
    loadDoc(url, {
      "$meta": { "$href": `${validationDomain}/common` },
      "type": "number"
    });
    hval = Hyperjump.fetch(`${testDomain}${url}`);
  });

  When("the document is meta validated", () => {
    let metaResult;

    before(async () => {
      const meta = await Validation.metaCompile(hval);
      metaResult = await Validation.metaInterpret(meta, hval, new Set());
    });

    Then("the result should be valid", async () => {
      expect(Validation.isValid(metaResult)).to.equal(true);
    });
  });

  When("the document is compiled", () => {
    let ast;

    before(async () => {
      ast = await Validation.compile(hval, {});
    });

    Then("the ast should have a entry for the keyword used", () => {
      expect(ast).to.eql({
        [`${testDomain}${url}`]: [
          [`${validationDomain}/common/type`, `${testDomain}${url}#/type`, "number"]
        ]
      });
    });

    And("the ast is interpreted with a valid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/valid`, 42);
        const subject = Hyperjump.fetch(`${testDomain}${url}/valid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should be valid", () => {
        expect(Validation.isValid(result)).to.equal(true);
      });
    });

    And("the ast is interpreted with an invalid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/invalid`, true);
        const subject = Hyperjump.fetch(`${testDomain}${url}/invalid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should not be valid", () => {
        expect(Validation.isValid(result)).to.equal(false);
      });
    });
  });
});

Given("a validation constraint", () => {
  const url = "/validation";
  let hval;

  before(() => {
    loadDoc(url, {
      "$meta": { "$href": `${validationDomain}/common` },
      "properties": {
        "foo": { "type": "number" }
      }
    });
    hval = Hyperjump.fetch(`${testDomain}${url}`);
  });

  When("the document is meta validated", () => {
    let metaResult;

    before(async () => {
      const meta = await Validation.metaCompile(hval);
      metaResult = await Validation.metaInterpret(meta, hval, new Set());
    });

    Then("the result should be valid", async () => {
      expect(Validation.isValid(metaResult)).to.equal(true);
    });
  });

  When("the document is compiled", () => {
    let ast;

    before(async () => {
      ast = await Validation.compile(hval, {});
    });

    Then("the ast should have a entry for the keyword used", () => {
      expect(ast).to.eql({
        [`${testDomain}${url}`]: [
          [`${validationDomain}/common/properties`, `${testDomain}${url}#/properties`, {
            "foo": `${testDomain}${url}#/properties/foo`
          }]
        ],
        [`${testDomain}${url}#/properties/foo`]: [
          [`${validationDomain}/common/type`, `${testDomain}${url}#/properties/foo/type`, "number"]
        ]
      });
    });

    And("the ast is interpreted with a valid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/valid`, { "foo": 42 });
        const subject = Hyperjump.fetch(`${testDomain}${url}/valid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should be valid", () => {
        expect(Validation.isValid(result)).to.equal(true);
      });
    });

    And("the ast is interpreted with an invalid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/invalid`, { "foo": true });
        const subject = Hyperjump.fetch(`${testDomain}${url}/invalid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should not be valid", () => {
        expect(Validation.isValid(result)).to.equal(false);
      });
    });
  });
});

Given("a recursive constraint", () => {
  const url = "/recursive";
  let hval;

  before(() => {
    loadDoc(url, {
      "$meta": { "$href": `${validationDomain}/common` },
      "type": "object",
      "properties": {
        "foo": { "$href": "#" }
      }
    });
    hval = Hyperjump.fetch(`${testDomain}${url}`);
  });

  When("the document is meta validated", () => {
    let metaResult;

    before(async () => {
      const meta = await Validation.metaCompile(hval);
      metaResult = await Validation.metaInterpret(meta, hval, new Set());
    });

    Then("the result should be valid", async () => {
      expect(Validation.isValid(metaResult)).to.equal(true);
    });
  });

  When("the document is compiled", () => {
    let ast;

    before(async () => {
      ast = await Validation.compile(hval, {});
    });

    Then("the ast should not recurse infinitly", () => {
      expect(ast).to.eql({
        [`${testDomain}${url}`]: [
          [`${validationDomain}/common/type`, `${testDomain}${url}#/type`, "object"],
          [`${validationDomain}/common/properties`, `${testDomain}${url}#/properties`, {
            "foo": `${testDomain}${url}#`
          }]
        ]
      });
    });

    And("the ast is interpreted with a valid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/valid`, { "foo": { "foo": {} } });
        const subject = Hyperjump.fetch(`${testDomain}${url}/valid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should be valid", () => {
        expect(Validation.isValid(result)).to.equal(true);
      });
    });

    And("the ast is interpreted with an invalid document", () => {
      let result;

      before(async () => {
        loadDoc(`${url}/invalid`, 42);
        const subject = Hyperjump.fetch(`${testDomain}${url}/invalid`);
        result = await Validation.interpret(ast, `${testDomain}${url}`)(subject, new Set());
      });

      Then("the result should not be valid", () => {
        expect(Validation.isValid(result)).to.equal(false);
      });
    });
  });
});
