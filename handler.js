'use strict';

const app = require('./app/main');

module.exports.quality = (event, context, callback) => {
  const city = event.request.intent.slots.City.value;

  app(city, callback);
};

// module.exports.quality({
//   request: {
//     intent: {
//       slots: {
//         City: {
//           name: "City",
//           value: "Liverpool"
//         }
//       }
//     }
//   }
// }, {}, (err, res) => {
//   console.log(err, res);
// })