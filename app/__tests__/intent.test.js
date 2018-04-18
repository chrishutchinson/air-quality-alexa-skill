jest.mock("../helpers/get-alexa-address");
jest.mock("../helpers/fetch");
jest.mock("defra-air-quality-js", () => ({
  findByNearestLocation: jest.fn(),
  list: jest.fn(() =>
    Promise.resolve([
      {
        title: "London",
        index: 5,
        description: "score is medium at index 5"
      },
      {
        title: "Glasgow",
        index: 3,
        description: "score is low at index 3"
      },
      {
        title: "York",
        index: 1,
        description: "score is low at index 1"
      },
      {
        title: "Yorkshire North",
        index: 2,
        description: "score is low at index 2"
      },
      {
        title: "Yorkshire South",
        index: 2,
        description: "score is low at index 2"
      },
      {
        title: "Manchester"
      },
      {
        title: "London Bushy Park",
        index: 2,
        description: "score is low at index 2"
      }
    ])
  )
}));

const lang = require("../lang/main")("en");
const intent = require("../intent");
const airQuality = require("defra-air-quality-js");
const getAlexaAddress = require("../helpers/get-alexa-address");
const fetchHelper = require("../helpers/fetch");

describe("#intent()", () => {
  it("should respond correctly if an unknown intent is passed", () => {
    const response = intent({
      request: {
        intent: {
          name: "some-unknown-intent"
        }
      }
    });

    expect(response).toEqual({
      outputSpeech: {
        type: "PlainText",
        text: lang.get("unknownIntent")
      },
      shouldEndSession: false,
      card: {
        content: lang.get("unknownIntent"),
        title: "UK Air quality check",
        type: "Simple"
      }
    });
  });

  it("should respond correctly if AMAZON.CancelIntent is passed", () => {
    const response = intent({
      request: {
        intent: {
          name: "AMAZON.CancelIntent"
        }
      }
    });

    expect(response).toEqual({
      card: null,
      outputSpeech: null,
      shouldEndSession: true
    });
  });

  it("should respond correctly if AMAZON.StopIntent is passed", () => {
    const response = intent({
      request: {
        intent: {
          name: "AMAZON.StopIntent"
        }
      }
    });

    expect(response).toEqual({
      card: null,
      outputSpeech: null,
      shouldEndSession: true
    });
  });

  it("should respond correctly if AMAZON.HelpIntent is passed", () => {
    const response = intent({
      request: {
        intent: {
          name: "AMAZON.HelpIntent"
        }
      }
    });

    expect(response).toEqual({
      outputSpeech: {
        type: "PlainText",
        text: lang.get("help")
      },
      shouldEndSession: false,
      card: {
        content: lang.get("help"),
        title: "UK Air quality check",
        type: "Simple"
      }
    });
  });

  it("should respond correctly if GetIndexDescription is passed", () => {
    const response = intent({
      request: {
        intent: {
          name: "GetIndexDescription"
        }
      }
    });

    expect(response).toEqual({
      outputSpeech: {
        type: "PlainText",
        text: lang.get("description")
      },
      shouldEndSession: true,
      card: {
        content: lang.get("description"),
        title: "UK Air quality check",
        type: "Simple"
      }
    });
  });

  describe("Intent: GetAirQualityByCity", () => {
    it("should respond correctly if no city is passed", () => {
      const response = intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {}
            }
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("invalidCity")
        },
        shouldEndSession: false,
        card: {
          content: lang.get("invalidCity"),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond correctly if no matching cities are found", async () => {
      const response = await intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                value: "Liverpool"
              }
            }
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("noMatchingLocation", { city: "Liverpool" })
        },
        shouldEndSession: true,
        card: {
          content: lang.get("noMatchingLocation", { city: "Liverpool" }),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond correctly if a matching city is found but it is not reporting an index", async () => {
      const response = await intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                value: "Manchester"
              }
            }
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("locationNotReporting", { city: "Manchester" })
        },
        shouldEndSession: true,
        card: {
          content: lang.get("locationNotReporting", { city: "Manchester" }),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond correctly if a matching city is found and it is reporting an index", async () => {
      const response = await intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                value: "Glasgow"
              }
            }
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("locationReport", {
            city: "Glasgow",
            text: "score is low at index 3"
          })
        },
        shouldEndSession: true,
        card: {
          content: lang.get("locationReport", {
            city: "Glasgow",
            text: "score is low at index 3"
          }),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond correctly if a matching city is found, it is reporting an index, and there is one other reporting location that matched the location name", async () => {
      const response = await intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                value: "London"
              }
            }
          }
        }
      });

      const expectedText = `${lang.get("locationReport", {
        city: "London",
        text: "score is medium at index 5"
      })} ${lang.get("additionalLocations", {
        locations: ["London Bushy Park"]
      })}`;

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: expectedText
        },
        shouldEndSession: true,
        card: {
          content: expectedText,
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond correctly if a matching city is found, it is reporting an index, and there are more than one other reporting locations that matched the location name", async () => {
      const response = await intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                value: "York"
              }
            }
          }
        }
      });

      const expectedText = `${lang.get("locationReport", {
        city: "York",
        text: "score is low at index 1"
      })} ${lang.get("additionalLocations", {
        locations: ["Yorkshire North", "Yorkshire South"]
      })}`;

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: expectedText
        },
        shouldEndSession: true,
        card: {
          content: expectedText,
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond with an error if defra-air-quality-js fails", async () => {
      airQuality.list.mockImplementation(() => Promise.reject("Some error"));

      const response = await intent({
        request: {
          intent: {
            name: "GetAirQualityByCity",
            slots: {
              City: {
                value: "Liverpool"
              }
            }
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("unknownError")
        },
        shouldEndSession: false,
        card: {
          content: lang.get("unknownError"),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });
  });

  describe("Intent: GetAirQualityByAddress", () => {
    beforeEach(() => {
      getAlexaAddress.mockImplementation(() =>
        Promise.resolve({
          postalCode: "AA1 1AA"
        })
      );

      fetchHelper.fetch.mockImplementation(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              result: {
                latitude: 51.509865,
                longitude: -0.118092
              }
            })
        })
      );
    });

    it("should respond with an error if the Alexa address service fails", async () => {
      getAlexaAddress.mockImplementation(() => Promise.reject("Some error"));

      const response = await intent({
        context: {
          System: {
            device: {
              deviceId: "abc"
            },
            user: {
              permissions: {
                consentToken: "123"
              }
            },
            apiEndpoint: "url"
          }
        },
        request: {
          intent: {
            name: "GetAirQualityByAddress"
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("requestFurtherPermissions")
        },
        shouldEndSession: true,
        card: {
          type: "AskForPermissionsConsent",
          permissions: [
            "read::alexa:device:all:address:country_and_postal_code"
          ]
        }
      });
    });

    it("should respond with an error if the Postcodes.io service returns a non-200 response", async () => {
      fetchHelper.fetch.mockImplementation(() =>
        Promise.resolve({
          status: 404
        })
      );

      const response = await intent({
        context: {
          System: {
            device: {
              deviceId: "abc"
            },
            user: {
              permissions: {
                consentToken: "123"
              }
            },
            apiEndpoint: "url"
          }
        },
        request: {
          intent: {
            name: "GetAirQualityByAddress"
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("requestFurtherPermissions")
        },
        shouldEndSession: true,
        card: {
          type: "AskForPermissionsConsent",
          permissions: [
            "read::alexa:device:all:address:country_and_postal_code"
          ]
        }
      });
    });

    it("should respond with an error if the defra-air-quality-js service fails", async () => {
      airQuality.findByNearestLocation.mockImplementation(() =>
        Promise.reject("airQuality error")
      );

      const response = await intent({
        context: {
          System: {
            device: {
              deviceId: "abc"
            },
            user: {
              permissions: {
                consentToken: "123"
              }
            },
            apiEndpoint: "url"
          }
        },
        request: {
          intent: {
            name: "GetAirQualityByAddress"
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("requestFurtherPermissions")
        },
        shouldEndSession: true,
        card: {
          type: "AskForPermissionsConsent",
          permissions: [
            "read::alexa:device:all:address:country_and_postal_code"
          ]
        }
      });
    });

    it("should respond correctly if a matching location is found but it is not reporting an index", async () => {
      airQuality.findByNearestLocation.mockImplementation(() => ({
        title: "Not Reporting",
        index: undefined
      }));

      const response = await intent({
        context: {
          System: {
            device: {
              deviceId: "abc"
            },
            user: {
              permissions: {
                consentToken: "123"
              }
            },
            apiEndpoint: "url"
          }
        },
        request: {
          intent: {
            name: "GetAirQualityByAddress"
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("locationNotReporting", {
            city: "Not Reporting"
          })
        },
        shouldEndSession: true,
        card: {
          content: lang.get("locationNotReporting", {
            city: "Not Reporting"
          }),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });

    it("should respond correctly if a matching location is found and it is reporting an index", async () => {
      airQuality.findByNearestLocation.mockImplementation(() => ({
        title: "London",
        index: 5,
        description: "score is medium at index 5"
      }));

      const response = await intent({
        context: {
          System: {
            device: {
              deviceId: "abc"
            },
            user: {
              permissions: {
                consentToken: "123"
              }
            },
            apiEndpoint: "url"
          }
        },
        request: {
          intent: {
            name: "GetAirQualityByAddress"
          }
        }
      });

      expect(response).toEqual({
        outputSpeech: {
          type: "PlainText",
          text: lang.get("locationReport", {
            city: "London",
            text: "score is medium at index 5"
          })
        },
        shouldEndSession: true,
        card: {
          content: lang.get("locationReport", {
            city: "London",
            text: "score is medium at index 5"
          }),
          title: "UK Air quality check",
          type: "Simple"
        }
      });
    });
  });
});
