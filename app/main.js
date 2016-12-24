'use strict';

const airQuality = require('defra-air-quality-js');

module.exports = {

  launch: (callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: `You can ask for the latest air quality data for a given location, like so: "Ask air quality what is the air quality today in Liverpool".`
        }
      }
    });
  },

  intent: function(event, callback) {
    switch(event.request.intent.name) {
      case 'GetIndexDescription':
        this.getIndexDescription(event, callback);
        return;
      case 'GetAirQuality':
        this.getAirQuality(event, callback);
        return;
      default:
        this.launch(callback);
        return;
    }
  },

  getIndexDescription: (event, callback) => {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: `Description of the index here.`
        }
      }
    });
  },

  getAirQuality: (event, callback) => {
    const city = event.request.intent.slots.City.value;

    if(typeof city === 'undefined') {
      callback(null, {
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: `Please provide a city or location to check the air quality for. For example: "Ask air quality what is the air quality today in Liverpool".`
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
        let message = `I'm sorry, I couldn't find any monitoring stations in ${city}.`;

        if(locations.length === 0) {
          return message;
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
        }

        return message;
      })
      .then(message => {
        return {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: message
            },
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