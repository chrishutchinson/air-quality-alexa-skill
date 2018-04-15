const launch = require("./app/launch");
const intent = require("./app/intent");
const isEventValid = require("./app/helpers/is-event-valid");

const asyncResponse = res =>
  Promise.resolve(res)
    .then(response => ({
      err: null,
      response
    }))
    .catch(err => ({
      err,
      response: null
    }));

const makeRequest = event => {
  // Switch over the various request types Alexa provides
  switch (event.request.type) {
    case "LaunchRequest": // When the skill is first launched. The user may say: "Alexa, open Air Quality"
      return asyncResponse(launch());

    case "IntentRequest": // When the user makes an voice request, like asking a question: "Alexa, ask Air Quality what the air quality is today in Liverpool"
      return asyncResponse(intent(event));

    case "SessionEndedRequest":
      // Session ended, cannot send response
      return asyncResponse(Promise.resolve(null));
  }
};

module.exports.quality = async (event, context, callback) => {
  // Validate our event first
  if (!isEventValid(event)) {
    callback("Request made from invalid application");
    return;
  }

  const { err, response } = await makeRequest(event);

  if (err) {
    callback(err);
    return;
  }

  // If all else fails, send an empty response
  callback(null, {
    version: "1.0",
    response
  });

  // console.log('event', event);
  // console.log('event.session.user.permissions', event.session.user.permissions);
  // console.log(
  //   'event.context.System.application',
  //   event.context.System.application
  // );
  // console.log('event.context.System.user', event.context.System.user);
  // console.log('event.context.System.device', event.context.System.device);
};
