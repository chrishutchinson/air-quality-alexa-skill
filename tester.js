const handler = require('./handler');

// Place the Alexa testing JSON here
const json = `{
  "session": {
    "sessionId": "SessionId.54c7745e-1e36-4b75-a823-6fcabacc3d6d",
    "application": {
      "applicationId": "amzn1.ask.skill.4d4283b6-20b5-44b1-9f7a-2e92a544a537"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AFHRHQ7K3E52KQE7LRHYHPY4TKENYARHI4AF4IT3EP6CO4ZICJTLKJEKSAFPOICULV5SWITEXEMASNKC5NG24BFSTMUI6AER5AAPD3ADROZLWY2MOXBXXM2T5P7DOKQFWAUQ6U6W4ESSRKPNMT5RLQSMJHBSPTORZUWDJJD5GFOZPZK6I7F6FYTB6HEHBJWZBA7ATPRDV3RA5GQ"
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.f5f27ad1-77a7-4397-95c9-4d899deb4ab0",
    "locale": "en-GB",
    "timestamp": "2016-12-24T14:39:40Z",
    "intent": {
      "name": "GetAirQuality",
      "slots": {
        "City": {
          "name": "City",
          "value": "jcdklsajfds"
        }
      }
    }
  },
  "version": "1.0"
}`;

// This will run the Alexa testing code through the handler and log the output to the console
handler.quality(JSON.parse(json), {}, (err, res) => {
  if(err) {
    console.log('[ERR]', err);
  } else {
    console.log(res);
  }
});