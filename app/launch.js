// Import language strings
const lang = require("./lang/main")("en");

// Import Alexa response builder
const buildResponse = require("./helpers/build-alexa-response");

module.exports = () => Promise.resolve(buildResponse(lang.get("launch")));
