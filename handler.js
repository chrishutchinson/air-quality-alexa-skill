'use strict';

const env = require('./env.json');

const app = require('./app/main');

const validation = {
  isValidEvent: (event) => {
    try {
      return (event.session.application.applicationId === env.applicationId);
    } catch(e) {
      return false;
    }
  }
}

module.exports.quality = (event, context, callback) => {
  if(!validation.isValidEvent(event)) {
    callback('Request made from invalid application');
    return;
  }

  const request = event.request;

  switch(request.type) {
    case 'LaunchRequest':
      app.launch(callback);
      return;

    case 'IntentRequest':
      app.intent(event, callback);
      return;

    case 'SessionEndedRequest':
      // Session ended, cannot send response (may want to log here)
      return;
  }
};