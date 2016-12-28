'use strict';

// Import Defra Air Quality parses
const airQuality = require('defra-air-quality-js');

// Import language strings
const lang = require('./lang/main')('en');

module.exports = {

  /**
   * Launch handler
   *
   * @param {function} callback - the callback to use upon completion
   */ 
  launch: (callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: lang.get('launch')
        },
        shouldEndSession: false
      }
    });
  },

  /**
   * Intent handler
   *
   * @param {object} event - the Alexa intent event object
   * @param {function} callback - the callback to use upon completion
   */
  intent: function(event, callback) {
    switch(event.request.intent.name) {
      case 'GetIndexDescription':
        this.getIndexDescription(event, callback);
        return;
      case 'GetAirQuality':
        this.getAirQuality(event, callback);
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
          text: lang.get('unknownIntent')
        },
        shouldEndSession: false
      }
    });
  },

  help: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: lang.get('help')
        },
        shouldEndSession: false
      }
    });
  },

  stop: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        shouldEndSession: true
      }
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
          text: lang.get('description')
        }
      }
    });
  },

  /**
   * Returns the air quality value and additional information for the given city
   *
   * @param {object} event - the Alexa intent event object
   * @param {function} callback - the callback to use upon completion
   */
  getAirQuality: (event, callback) => {
    const city = event.request.intent.slots.City.value;

    if(typeof city === 'undefined') {
      callback(null, {
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: lang.get('invalidCity')
          }
        }
      });

      return;
    }

    airQuality()
      .then(data => {
        return data.filter(location => {
          return location.title.includes(city);
        });
      })
      .then(locations => {
        let shouldEndSession = true;
        let message = lang.get('noMatchingLocation', { city: city });

        if(locations.length === 0) {
          return {
            message: message,
            shouldEndSession: shouldEndSession
          };
        }

        const location = locations[0];
        
        if(typeof location.index === 'undefined') {
          message = `The monitoring station at ${location.title} is currently not reporting an air quality index, please try again later.`;
        } else {
          message = `At the ${location.title} monitoring station, the ${location.description.toLowerCase()}.`;
        }

        locations = locations.filter(l => {
          return (l.index !== 'undefined') &&
                 (l.title !== location.title);
        });

        if(locations.length > 0) {
          const locationNames = locations.map(l => {
            return l.title;
          });

          message += ` I have found ${locations.length} other ${(locations.length === 1 ? 'station' : 'stations')} in the location you requested, you might want to try${(locations.length === 1 ? ': ' : ' one of these: ')}`;

          message += [locationNames.slice(0, -1).join(', '),locationNames.slice(-1)[0]]
                      .join(locationNames.length < 2 ? '' : ' and ');

          shouldEndSession = false;    
        }

        return {
          message: message,
          shouldEndSession: shouldEndSession
        };
      })
      .then(responseData => {
        const message = responseData.message;
        const shouldEndSession = responseData.shouldEndSession;

        return {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: message
            },
            shouldEndSession: shouldEndSession,
            card: {
              type: 'Simple',
              title: 'UK Air quality check',
              content: message
            }
          }
        };
      })
      .then(response => { callback(null, response) })
      .catch(err => callback)
  }
}