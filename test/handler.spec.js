jest.mock("../app/launch", () => jest.fn());
jest.mock("../app/intent", () => jest.fn());
jest.mock("../app/helpers/is-event-valid", () => jest.fn());
const launch = require("../app/launch");
const intent = require("../app/intent");
const isEventValid = require("../app/helpers/is-event-valid");
const handler = require("../handler");

describe("handler", () => {
  describe("#quality()", () => {
    beforeEach(() => {
      isEventValid.mockImplementation(() => true);
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.resetModules();
    });

    it("should return an error in the callback if the event is invalid", done => {
      isEventValid.mockImplementation(() => false);

      handler.quality({}, {}, err => {
        expect(err).toEqual("Request made from invalid application");
        done();
      });
    });

    it("should return an error in the callback if the request cannot be fulfilled", done => {
      launch.mockImplementation(() => Promise.reject("Some error"));

      handler.quality(
        {
          session: {
            application: {
              applicationId: "test-application-id"
            }
          },
          request: {
            type: "LaunchRequest"
          }
        },
        {},
        err => {
          expect(err).toEqual("Some error");
          done();
        }
      );
    });

    it("should call `app.launch` when a LaunchRequest is made", () => {
      launch.mockImplementation(() => Promise.resolve({}));

      handler.quality(
        {
          session: {
            application: {
              applicationId: "sample-application-id"
            }
          },
          request: {
            type: "LaunchRequest"
          }
        },
        {},
        () => {}
      );

      expect(launch).toHaveBeenCalledTimes(1);
    });

    it("should return a response in the callback if a valid LaunchReqest is made", done => {
      launch.mockImplementation(() => Promise.resolve({ foo: "bar" }));

      handler.quality(
        {
          session: {
            application: {
              applicationId: "test-application-id"
            }
          },
          request: {
            type: "LaunchRequest"
          }
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            version: "1.0",
            response: { foo: "bar" }
          });
          done();
        }
      );
    });

    it("should call `app.intent` when a IntentRequest is made", () => {
      handler.quality(
        {
          session: {
            application: {
              applicationId: "sample-application-id"
            }
          },
          request: {
            type: "IntentRequest"
          }
        },
        {},
        () => {}
      );

      expect(intent).toHaveBeenCalledWith({
        session: {
          application: {
            applicationId: "sample-application-id"
          }
        },
        request: {
          type: "IntentRequest"
        }
      });
    });

    it("should return a response in the callback if a valid IntentRequest is made", done => {
      intent.mockImplementation(() => Promise.resolve({ foo: "baz" }));

      handler.quality(
        {
          session: {
            application: {
              applicationId: "test-application-id"
            }
          },
          request: {
            type: "IntentRequest"
          }
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            version: "1.0",
            response: { foo: "baz" }
          });
          done();
        }
      );
    });

    it("should return a response in the callback if a valid SessionEndedRequest is made", done => {
      handler.quality(
        {
          session: {
            application: {
              applicationId: "test-application-id"
            }
          },
          request: {
            type: "SessionEndedRequest"
          }
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            version: "1.0",
            response: null
          });
          done();
        }
      );
    });
  });
});
