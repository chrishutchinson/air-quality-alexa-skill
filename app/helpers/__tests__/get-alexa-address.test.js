jest.mock("../fetch");
const fetchHelper = require("../fetch");

const getAlexaAddress = require("../get-alexa-address");

describe("#getAlexaAddress()", () => {
  beforeEach(() => {
    fetchHelper.fetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            foo: "bar"
          })
      })
    );
  });

  it("should reject if a device ID is not provided", () => {
    expect.assertions(1);

    return getAlexaAddress(null).catch(e => {
      expect(e).toEqual("Invalid device ID");
    });
  });

  it("should reject if a consent token is not provided", () => {
    expect.assertions(1);

    return getAlexaAddress("device-id", null).catch(e => {
      expect(e).toEqual("Invalid consent token");
    });
  });

  it("should reject if an API endpoint is not provided", () => {
    expect.assertions(1);

    return getAlexaAddress("device-id", "consent-token", null).catch(e => {
      expect(e).toEqual("Invalid API endpoint");
    });
  });

  it("should reject if the fetch call fails", () => {
    fetchHelper.fetch.mockImplementation(() =>
      Promise.resolve({
        status: 404,
        statusText: "Invalid request"
      })
    );
    expect.assertions(1);

    return getAlexaAddress("device-id", "consent-token", "api-endpoint").catch(
      e => {
        expect(e).toEqual(new Error("Invalid request"));
      }
    );
  });

  it("should respond correctly if the fetch call succeeds", () => {
    return getAlexaAddress("device-id", "consent-token", "api-endpoint").then(
      res => {
        expect(res).toEqual({ foo: "bar" });
      }
    );
  });
});
