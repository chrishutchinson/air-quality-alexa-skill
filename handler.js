'use strict';

// Load env vars
const env = require('./.env.json');

// Load the core app
const app = require('./app/main');

// Validation methods all live in here
const validation = {

  /**
   * Checks if the provided event is valid
   *
   * @param {object} event - the event to validate against
   */
  isValidEvent: (event) => {
    try {
      // Check if the event's applicationId matches the one this app is set up to use
      return (event.session.application.applicationId === env.applicationId);
    } catch(e) {
      return false;
    }
  }
}

module.exports.quality = (event, context, callback) => {

  // Validate our event first
  if(!validation.isValidEvent(event)) {
    callback('Request made from invalid application');
    return;
  }

  // Grab the request for future use
  const request = event.request;

  // Switch over the various request types Alexa provides
  switch(request.type) {
    case 'LaunchRequest': // When the skill is first launched. The user may say: "Alexa, open Air Quality"
      app.launch(callback);
      return;

    case 'IntentRequest': // When the user makes an voice request, like asking a question: "Alexa, ask Air Quality what the air quality is today in Liverpool"
      app.intent(event, callback);
      return;

    case 'SessionEndedRequest':
      // Session ended, cannot send response
      return;
  }

  // If all else fails, send an empty response
  callback(null, {});
};