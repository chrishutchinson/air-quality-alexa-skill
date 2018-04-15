const lang = require("../lang/main")("en");
const launch = require("../launch");

describe("#launch()", () => {
  it("should keep the session open when triggered", () => {
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
