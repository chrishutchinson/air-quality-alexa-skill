const handler = require('./handler');

// Place the Alexa testing JSON here
const json = ``;

// This will run the Alexa testing code through the handler and log the output to the console
handler.quality(JSON.parse(json), {}, (err, res) => {
  if(err) {
    console.log('[ERR]', err);
  } else {
    console.log(res);
  }
});