// Import Defra Air Quality parser
const airQuality = require("defra-air-quality-js");

// Import language strings
const lang = require("./lang/main")("en");

// Import fetch
const fetchHelper = require("./helpers/fetch");

// Import Alexa address helper
const getAlexaAddress = require("./helpers/get-alexa-address");

// Import Alexa response builder
const buildResponse = require("./helpers/build-alexa-response");

const processAddress = address =>
  fetchHelper
    .fetch(`https://api.postcodes.io/postcodes/${address.postalCode}`)
    .then(response => {
      switch (response.status) {
        case 200:
          return response;
        default:
          throw new Error("Unable to process address");
      }
    })
    .then(response => response.json())
    .then(({ result }) => result);

const getAirQualityByAddress = event => {
  const deviceId = event.context.System.device.deviceId;
  const consentToken = event.context.System.user.permissions.consentToken;
  const apiEndpoint = event.context.System.apiEndpoint;

  return getAlexaAddress(deviceId, consentToken, apiEndpoint)
    .then(processAddress)
    .then(({ latitude, longitude }) =>
      airQuality.findByNearestLocation(latitude, longitude)
    )
    .then(station => {
      let message;

      if (typeof station.index === "undefined") {
        message = `The monitoring station at ${
          station.title
        } is currently not reporting an air quality index, please try again later.`;
      } else {
        message = `At the ${
          station.title
        } monitoring station, the ${station.description.toLowerCase()}.`;
      }

      return {
        message,
        shouldEndSession: true
      };
    })
    .then(({ message, shouldEndSession }) =>
      buildResponse(message, shouldEndSession)
    )
    .catch(() => ({
      ...buildResponse(lang.get("requestFurtherPermissions"), true),
      card: {
        type: "AskForPermissionsConsent",
        permissions: ["read::alexa:device:all:address:country_and_postal_code"]
      }
    }));
};

/**
 * Returns the air quality value and additional information for the given city
 *
 * @param {object} event - the Alexa intent event object
 */
const getAirQualityByCity = event => {
  const city = event.request.intent.slots.City.value;

  if (typeof city === "undefined")
    return Promise.resolve({
      outputSpeech: {
        type: "PlainText",
        text: lang.get("invalidCity")
      }
    });

  return airQuality
    .list()
    .then(data => data.filter(location => location.title.includes(city)))
    .then(locations => {
      let shouldEndSession = true;
      let message = lang.get("noMatchingLocation", { city: city });

      if (locations.length === 0)
        return {
          message,
          shouldEndSession
        };

      const [location] = locations;

      if (typeof location.index === "undefined") {
        message = `The monitoring station at ${
          location.title
        } is currently not reporting an air quality index, please try again later.`;
      } else {
        message = `At the ${
          location.title
        } monitoring station, the ${location.description.toLowerCase()}.`;
      }

      const filteredLocations = locations.filter(
        l => l.index !== "undefined" && l.title !== location.title
      );

      if (filteredLocations.length > 0) {
        const locationNames = filteredLocations.map(l => l.title);

        message += ` I have found ${filteredLocations.length} other ${
          filteredLocations.length === 1 ? "station" : "stations"
        } in the location you requested, you might want to try${
          filteredLocations.length === 1
            ? " this next time: "
            : " one of these next time: "
        }`;

        message += [
          locationNames.slice(0, -1).join(", "),
          locationNames.slice(-1)[0]
        ].join(locationNames.length < 2 ? "" : " and ");

        shouldEndSession = true;
      }

      return {
        message,
        shouldEndSession
      };
    })
    .then(({ message, shouldEndSession }) =>
      buildResponse(message, shouldEndSession)
    )
    .catch(() => buildResponse(lang.get("unknownError"), false));
};

module.exports = event => {
  switch (event.request.intent.name) {
    case "GetIndexDescription":
      return buildResponse(lang.get("description"));
    case "GetAirQualityByCity":
      return getAirQualityByCity(event);
    case "GetAirQualityByAddress":
      return getAirQualityByAddress(event);
    case "AMAZON.HelpIntent":
      return buildResponse(lang.get("help"));
    case "AMAZON.StopIntent":
    case "AMAZON.CancelIntent":
      return buildResponse(null, true);
    default:
      return buildResponse(lang.get("unknownIntent"));
  }
};
