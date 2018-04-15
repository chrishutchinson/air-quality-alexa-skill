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
  const { deviceId } = event.context.System.device;
  const { apiEndpoint, apiAccessToken } = event.context.System;

  return getAlexaAddress(deviceId, apiAccessToken, apiEndpoint)
    .then(processAddress)
    .then(({ latitude, longitude }) =>
      airQuality.findByNearestLocation(latitude, longitude)
    )
    .then(station => {
      let message;

      if (typeof station.index === "undefined") {
        message = lang.get("locationNotReporting", { city: station.title });
      } else {
        message = lang.get("locationReport", {
          city: station.title,
          text: station.description
        });
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
    return buildResponse(lang.get("invalidCity"));

  return airQuality
    .list()
    .then(data =>
      data.filter(location =>
        location.title.toLowerCase().includes(city.toLowerCase())
      )
    )
    .then(locations => {
      let shouldEndSession = true;
      let message = lang.get("noMatchingLocation", { city });

      if (locations.length === 0)
        return {
          message,
          shouldEndSession
        };

      const [location] = locations;

      if (typeof location.index === "undefined") {
        message = lang.get("locationNotReporting", { city: location.title });
      } else {
        message = lang.get("locationReport", {
          city: location.title,
          text: location.description
        });
      }

      const otherLocations = locations.filter(
        l => l.index !== "undefined" && l.title !== location.title
      );

      if (otherLocations.length > 0) {
        message += ` ${lang.get("additionalLocations", {
          locations: otherLocations.map(l => l.title)
        })}`;
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
