const config = require("../../config");

// Validation methods all live in here
module.exports = event => {
  try {
    // Check if the event's applicationId matches the one this app is set up to use
    return (
      event.session.application.applicationId === config.alexaApplicationId
    );
  } catch (e) {
    return false;
  }
};
