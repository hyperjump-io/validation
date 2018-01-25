const expect = require("chai").expect;
const JsonSchema = require("./json-schema");


describe("JSON Schema", () => {
  describe('a schema with `"maxLength": 3`', () => {
    const schema = { "maxLength": 3 };

    it("should be true for a string with 3 or less characters", () => {
      expect(JsonSchema.validate(schema, "foo")).to.eql(true);
    });

    it("should not be true if the data is 4 or more characters", () => {
      expect(JsonSchema.validate(schema, "foobar")).to.eql(false);
    });

    it("should be true if the data is not a string", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(true);
    });
  });

  describe('a schema with `"minLength": 3`', () => {
    const schema = { "minLength": 3 };

    it("should be true for a string with 3 or more characters", () => {
      expect(JsonSchema.validate(schema, "foobar")).to.eql(true);
    });

    it("should not be true if the data is 2 or less characters", () => {
      expect(JsonSchema.validate(schema, "fo")).to.eql(false);
    });

    it("should be true if the data is not a string", () => {
      expect(JsonSchema.validate(schema, {})).to.eql(true);
    });
  });
});
