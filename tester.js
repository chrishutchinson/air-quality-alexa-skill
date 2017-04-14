const handler = require('./handler');

// Place the Alexa testing JSON here
const jsonWithAddressPermissions = `{
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": ""
    },
    "attributes": {},
    "user": {
      "userId": "",
      "permissions": {
        "consentToken": ""
      }
    },
    "new": true
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": ""
      },
      "user": {
        "userId": "",
        "permissions": {
          "consentToken": ""
        }
      },
      "device": {
        "deviceId": "",
        "supportedInterfaces": {
          "AudioPlayer": {}
        }
      },
      "apiEndpoint": "https://api.eu.amazonalexa.com"
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "",
      "timestamp": "2017-04-14T19:40:39Z",
      "locale": "en-GB"
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "",
    "locale": "en-GB",
    "timestamp": "2016-12-24T14:39:40Z",
    "intent": {
      "name": "GetAirQuality",
      "slots": {
        "City": {
          "name": "City",
          "value": "London"
        }
      }
    }
  },
  "version": "1.0"
}`;

const jsonWithoutAddressPermissions = `{
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": ""
    },
    "attributes": {},
    "user": {
      "userId": "",
      "permissions": {}
    },
    "new": true
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": ""
      },
      "user": {
        "userId": "",
        "permissions": {}
      },
      "device": {
        "deviceId": "",
        "supportedInterfaces": {
          "AudioPlayer": {}
        }
      },
      "apiEndpoint": "https://api.eu.amazonalexa.com"
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "",
      "timestamp": "2017-04-14T19:40:39Z",
      "locale": "en-GB"
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "",
    "locale": "en-GB",
    "timestamp": "2016-12-24T14:39:40Z",
    "intent": {
      "name": "GetLocalAirQuality"
    }
  },
  "version": "1.0"
}`;

// This will run the Alexa testing code through the handler and log the output to the console
handler.quality(JSON.parse(jsonWithoutAddressPermissions), {}, (err, res) => {
  if (err) {
    console.log('[ERR]', err);
  } else {
    console.log(res);
  }
});
