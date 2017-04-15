// Import fetch
const fetchHelper = require('./fetch');

module.exports = (deviceId, consentToken, apiEndpoint) => {
  return new Promise((resolve, reject) => {
    if (!deviceId) return reject(new Error('Invalid device ID'));
    if (!consentToken) return reject(new Error('Invalid consent token'));
    if (!apiEndpoint) return reject(new Error('Invalid API endpoint'));

    fetchHelper
      .fetch(
        `${apiEndpoint}/v1/devices/${deviceId}/settings/address/countryAndPostalCode`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${consentToken}`,
          },
        }
      )
      .then(response => {
        switch (response.status) {
          case 200:
            return response;
          default:
            throw new Error(response.statusText);
            return;
        }
      })
      .then(response => response.json())
      .then(json => {
        resolve(json);
      })
      .catch(err => {
        reject(err);
      });
  });
};
