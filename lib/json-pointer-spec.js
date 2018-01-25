const expect = require("chai").expect;
const JsonPointer = require("./json-pointer");


describe("JSON Pointer", () => {
  const subject = {"title": "My Title",
                     "nested": {"number": 10}};
  describe('a pointer that is an empty string', () => {
    const pointer = "";
    it("should return the subject", () => {
      expect(JsonPointer.get(pointer, subject)).to.eql(subject);
    });
  });

  describe('a pointer that references a top level property', () => {
    const pointer = "/title";
    it("should return 'My Title'", () => {
      expect(JsonPointer.get(pointer, subject)).to.eql("My Title");
    });
  })

  describe('a pointer that references a nested (second level) property', () => {
    const pointer = "/nested/number";
    it("should return 10", () => {
      expect(JsonPointer.get(pointer, subject)).to.eql(10);
    });
  })
});
