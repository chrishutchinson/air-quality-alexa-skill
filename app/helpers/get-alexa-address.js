// Import fetch
const fetchHelper = require("./fetch");

module.exports = (deviceId, consentToken, apiEndpoint) => {
  if (!deviceId) return Promise.reject("Invalid device ID");
  if (!consentToken) return Promise.reject("Invalid consent token");
  if (!apiEndpoint) return Promise.reject("Invalid API endpoint");

  return fetchHelper
    .fetch(
      `${apiEndpoint}/v1/devices/${deviceId}/settings/address/countryAndPostalCode`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${consentToken}`
        }
      }
    )
    .then(response => {
      switch (response.status) {
        case 200:
          return response;
        default:
          throw new Error(response.statusText);
      }
    })
    .then(response => response.json());
};
