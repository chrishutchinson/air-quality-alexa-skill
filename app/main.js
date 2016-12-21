'use strict';

const airQuality = require('defra-air-quality-js');

module.exports = (city, callback) => {
  if(typeof city === 'undefined') {
    callback(null, {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: `Please provide a city or location to check the air quality for. For example: "Ask UK air quality what is the air quality today in Liverpool".`
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