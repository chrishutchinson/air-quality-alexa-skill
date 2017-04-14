'use strict';

// Import Defra Air Quality parses
const airQuality = require('./air-quality');

// Import language strings
const lang = require('./lang/main')('en');

// Import fetch
const fetchHelper = require('./helpers/fetch');

// Import Alexa address helper
const getAlexaAddress = require('./helpers/get-alexa-address');

// Import Alexa response builder
const buildResponse = require('./helpers/build-alexa-response');

module.exports = {
  /**
   * Launch handler
   *
   * @param {function} callback - the callback to use upon completion
   */
  launch: callback => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: lang.get('launch'),
        },
        shouldEndSession: false,
      },
    });
  },

  /**
   * Intent handler
   *
   * @param {object} event - the Alexa intent event object
   * @param {function} callback - the callback to use upon completion
   */
  intent: function(event, callback) {
    switch (event.request.intent.name) {
      case 'GetIndexDescription':
        this.getIndexDescription(event, callback);
        return;
      case 'GetAirQuality':
        this.getCityAirQuality(event, callback);
        return;
      case 'GetLocalAirQuality':
        this.getLocalAirQuality(event, callback);
        return;
      case 'AMAZON.HelpIntent':
        this.help(event, callback);
        return;
      case 'AMAZON.StopIntent':
      case 'AMAZON.CancelIntent':
        this.stop(event, callback);
        return;
      default:
        this.unknownIntent(event, callback);
        return;
    }
  },

  unknownIntent: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: lang.get('unknownIntent'),
        },
        shouldEndSession: false,
      },
    });
  },

  help: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: lang.get('help'),
        },
        shouldEndSession: false,
      },
    });
  },

  stop: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        shouldEndSession: true,
      },
    });
  },

  /**
   * Returns the description of the Defra Air Quality Index (AQI)
   *
   * @param {object} event - the Alexa intent event object
   * @param {function} callback - the callback to use upon completion
   */
  getIndexDescription: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: lang.get('description'),
        },
      },
    });
  },

  getLocalAirQuality: (event, callback) => {
    const deviceId = event.context.System.device.deviceId;
    const consentToken = event.context.System.user.permissions.consentToken;
    const apiEndpoint = event.context.System.apiEndpoint;

    getAlexaAddress(deviceId, consentToken, apiEndpoint)
      .then(address => {
        // Address: { "countryCode" : "US", "postalCode" : "98109" }
        airQuality
          .getByPostcode(address.postalCode)
          .then(responseData => {
            const message = responseData.message;
            const shouldEndSession = responseData.shouldEndSession;

            return buildResponse(message, shouldEndSession);
          })
          .then(response => {
            callback(null, response);
          });
      })
      .catch(err => {
        // The user hasn't granted us permissions for their address, we need to prompt them for it
        callback(null, {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: lang.get('requestFurtherPermissions'),
            },
            shouldEndSession: true,
            card: {
              type: 'AskForPermissionsConsent',
              permissions: [
                'read::alexa:device:all:address:country_and_postal_code',
              ],
            },
          },
        });
      });
  },

  /**
   * Returns the air quality value and additional information for the given city
   *
   * @param {object} event - the Alexa intent event object
   * @param {function} callback - the callback to use upon completion
   */
  getCityAirQuality: (event, callback) => {
    const city = event.request.intent.slots.City.value;

    if (typeof city === 'undefined') {
      callback(null, {
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: lang.get('invalidCity'),
          },
        },
      });

      return;
    }

    airQuality
      .get()
      .then(data => {
        return data.filter(location => {
          return location.title.includes(city);
        });
      })
      .then(locations => {
        let shouldEndSession = true;
        let message = lang.get('noMatchingLocation', { city: city });

        if (locations.length === 0) {
          return {
            message: message,
            shouldEndSession: shouldEndSession,
          };
        }

        const location = locations[0];

        if (typeof location.index === 'undefined') {
          message = `The monitoring station at ${location.title} is currently not reporting an air quality index, please try again later.`;
        } else {
          message = `At the ${location.title} monitoring station, the ${location.description.toLowerCase()}.`;
        }

        locations = locations.filter(l => {
          return l.index !== 'undefined' && l.title !== location.title;
        });

        if (locations.length > 0) {
          const locationNames = locations.map(l => {
            return l.title;
          });

          message += ` I have found ${locations.length} other ${locations.length === 1 ? 'station' : 'stations'} in the location you requested, you might want to try${locations.length === 1 ? ' this next time: ' : ' one of these next time: '}`;

          message += [
            locationNames.slice(0, -1).join(', '),
            locationNames.slice(-1)[0],
          ].join(locationNames.length < 2 ? '' : ' and ');

          shouldEndSession = true;
        }

        return {
          message: message,
          shouldEndSession: shouldEndSession,
        };
      })
      .then(responseData => {
        const message = responseData.message;
        const shouldEndSession = responseData.shouldEndSession;

        return buildResponse(message, shouldEndSession);
      })
      .then(response => {
        callback(null, response);
      })
      .catch(err => {
        const response = buildResponse(lang.get('unknownError'), false);
        callback(null, response);
      });
  },
};
