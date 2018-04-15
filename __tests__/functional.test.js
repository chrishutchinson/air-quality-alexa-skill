const { quality } = require("../handler");

describe("functional tests", () => {
  describe("Air quality by named location", () => {
    it("should respond correctly", done => {
      const event = {
        session: {
          sessionId: "",
          application: {
            applicationId: ""
          },
          attributes: {},
          user: {
            userId: "",
            permissions: {
              consentToken: ""
            }
          },
          new: true
        },
        context: {
          AudioPlayer: {
            playerActivity: "IDLE"
          },
          System: {
            application: {
              applicationId: ""
            },
            user: {
              userId: "",
              permissions: {
                consentToken: ""
              }
            },
            device: {
              deviceId: "",
              supportedInterfaces: {
                AudioPlayer: {}
              }
            },
            apiEndpoint: "https://api.eu.amazonalexa.com"
          },
          request: {
            type: "LaunchRequest",
            requestId: "",
            timestamp: "2017-04-14T19:40:39Z",
            locale: "en-GB"
          }
        },
        request: {
          type: "IntentRequest",
          requestId: "",
          locale: "en-GB",
          timestamp: "2016-12-24T14:39:40Z",
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                name: "City",
                value: "London"
              }
            }
          }
        },
        version: "1.0"
      };

      quality(event, {}, (err, { response }) => {
        expect(response.card.title).toEqual("UK Air quality check");
        expect(response.card.type).toEqual("Simple");
        expect(response.card.content).toMatch(
          /At the .*? monitoring station, the current pollution level is .*? at index .*?\./
        );
        done();
      });
    });
  });

  describe("Air quality by current location, without permissions", () => {
    it("should respond correctly", done => {
      const event = {
        session: {
          sessionId: "",
          application: {
            applicationId: ""
          },
          attributes: {},
          user: {
            userId: "",
            permissions: {}
          },
          new: true
        },
        context: {
          AudioPlayer: {
            playerActivity: "IDLE"
          },
          System: {
            application: {
              applicationId: ""
            },
            user: {
              userId: "",
              permissions: {}
            },
            device: {
              deviceId: "",
              supportedInterfaces: {
                AudioPlayer: {}
              }
            },
            apiEndpoint: "https://api.eu.amazonalexa.com"
          },
          request: {
            type: "LaunchRequest",
            requestId: "",
            timestamp: "2017-04-14T19:40:39Z",
            locale: "en-GB"
          }
        },
        request: {
          type: "IntentRequest",
          requestId: "",
          locale: "en-GB",
          timestamp: "2016-12-24T14:39:40Z",
          intent: {
            name: "GetAirQualityByAddress"
          }
        },
        version: "1.0"
      };

      quality(event, {}, (err, { response }) => {
        expect(response.outputSpeech.text).toEqual(
          `To ask for Air Quality data by postcode, you must grant additional permissions. Please check the Alexa app, where you can grant these, and try asking again. If you choose not to grant these permissions, you can still ask for air quality data, but must ask for a specific location, like so: "Alexa ask Air Quality what is it like today in Liverpool".`
        );
        expect(response.outputSpeech.type).toEqual("PlainText");
        expect(response.shouldEndSession).toEqual(true);
        expect(response.card.type).toEqual("AskForPermissionsConsent");
        done();
      });
    });
  });
});
