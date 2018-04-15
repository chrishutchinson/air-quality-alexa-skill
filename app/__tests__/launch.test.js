const lang = require("../lang/main")("en");
const launch = require("../launch");

describe("#launch()", () => {
  it("should respond with the correct message", () => {
    const response = launch();

    expect(response).toEqual({
      outputSpeech: {
        type: "PlainText",
        text: lang.get("launch")
      },
      shouldEndSession: false,
      card: {
        content: lang.get("launch"),
        title: "UK Air quality check",
        type: "Simple"
      }
    });
  });
});
