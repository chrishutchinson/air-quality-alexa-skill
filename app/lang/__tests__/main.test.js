jest.mock("../en", () => ({
  someString: () => `This is my string`,
  someStringWithData: data => `This is my string, and your name is ${data.name}`
}));
const en = require("../en");
const lang = require("../main");

describe("lang", () => {
  describe("#get()", () => {
    it("should return the original key if the string is not found", () => {
      expect(lang("en").get("invalid-lang-string")).toEqual(
        "invalid-lang-string"
      );
    });

    it("should return the string based on the key if it is found", () => {
      expect(lang("en").get("someString")).toEqual("This is my string");
    });

    it("should pass the data into the string", () => {
      expect(lang("en").get("someStringWithData", { name: "Chris" })).toEqual(
        "This is my string, and your name is Chris"
      );
    });
  });
});
