const app = require('./main');

app('Liverpool', (err, response) => {
  console.log('[ERR]', err);
  console.log('[RESPONSE]', response);
});