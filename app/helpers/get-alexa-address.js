// Import fetch
const fetchHelper = require("./fetch");

module.exports = (deviceId, apiAccessToken, apiEndpoint) => {
  if (!deviceId) return Promise.reject("Invalid device ID");
  if (!apiAccessToken) return Promise.reject("Invalid access token");
  if (!apiEndpoint) return Promise.reject("Invalid API endpoint");

  return fetchHelper
    .fetch(
      `${apiEndpoint}/v1/devices/${deviceId}/settings/address/countryAndPostalCode`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiAccessToken}`
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
