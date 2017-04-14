module.exports = (message, shouldEndSession) => ({
  version: '1.0',
  response: {
    outputSpeech: {
      type: 'PlainText',
      text: message,
    },
    shouldEndSession: shouldEndSession,
    card: {
      type: 'Simple',
      title: 'UK Air quality check',
      content: message,
    },
  },
});
