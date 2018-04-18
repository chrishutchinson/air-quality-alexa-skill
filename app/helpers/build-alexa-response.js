module.exports = (message, shouldEndSession = false) => ({
  outputSpeech: message && {
    type: "PlainText",
    text: message
  },
  shouldEndSession: shouldEndSession,
  card: message && {
    type: "Simple",
    title: "UK Air quality check",
    content: message
  }
});
