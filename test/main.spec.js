// Import chai.
const chai = require('chai');
const sinon = require('sinon');
const lang = require('../app/lang/main')('en');
const proxyquire = require('proxyquire');
const expect = chai.expect;

const defraJsStub = {
  get: () =>
    Promise.resolve([
      {
        title: 'Oxford St Ebbes',
        link: 'http://uk-air.defra.gov.uk/data/site-data?f_site_id=OX8&view=last_hour',
        location: 'Location: 51°44´41.30"N    1°15´37.00"W ',
        description: 'Current Pollution level is Low at index 1',
        level: 'Low',
        index: '1',
      },
      {
        title: 'Reading Central',
        link: 'http://uk-air.defra.gov.uk/data/site-data?f_site_id=REA5&view=last_hour',
        location: 'Location: 51°27´17.63"N    0°56´25.38"W ',
        description: 'Current Pollution level is Low at index 2',
        level: 'Low',
        index: '2',
      },
      {
        title: 'Reading London Rd.',
        link: 'http://uk-air.defra.gov.uk/data/site-data?f_site_id=REA5&view=last_hour',
        location: 'Location: 51°27´17.63"N    0°56´25.38"W ',
        description: 'Current Pollution level is Low at index 1',
        level: 'Low',
        index: '1',
      },
      {
        title: 'London Teddington',
        link: 'http://uk-air.defra.gov.uk/data/site-data?f_site_id=REA5&view=last_hour',
        location: 'Location: 51°27´17.63"N    0°56´25.38"W ',
      },
    ]),
};

const app = proxyquire('../app/main', {
  './air-quality': defraJsStub,
});

describe('main', () => {
  describe('#launch()', () => {
    it('should keep the session open when triggered', done => {
      app.launch((err, res) => {
        expect(res.response.shouldEndSession).to.be.false;
        done();
      });
    });
  });

  describe('#intent()', () => {
    it('should call app.getIndexDescription() if the GetIndexDescription intent is supplied', done => {
      sinon.spy(app, 'getIndexDescription');

      app.intent(
        {
          request: {
            intent: {
              name: 'GetIndexDescription',
            },
          },
        },
        () => {
          expect(app.getIndexDescription.calledOnce).to.be.true;
          app.getIndexDescription.restore();

          done();
        }
      );
    });

    it('should call app.getAirQuality() if the GetAirQuality intent is supplied', done => {
      sinon.spy(app, 'getAirQuality');

      app.intent(
        {
          request: {
            intent: {
              name: 'GetAirQuality',
              slots: {
                City: {
                  value: '',
                },
              },
            },
          },
        },
        () => {
          expect(app.getAirQuality.calledOnce).to.be.true;
          app.getAirQuality.restore();

          done();
        }
      );
    });

    it('should call app.help() if the AMAZON.HelpIntent intent is supplied', done => {
      sinon.spy(app, 'help');

      app.intent(
        {
          request: {
            intent: {
              name: 'AMAZON.HelpIntent',
            },
          },
        },
        () => {
          expect(app.help.calledOnce).to.be.true;
          app.help.restore();

          done();
        }
      );
    });

    it('should call app.stop() if the AMAZON.StopIntent intent is supplied', done => {
      sinon.spy(app, 'stop');

      app.intent(
        {
          request: {
            intent: {
              name: 'AMAZON.StopIntent',
            },
          },
        },
        () => {
          expect(app.stop.calledOnce).to.be.true;
          app.stop.restore();

          done();
        }
      );
    });

    it('should call app.stop() if the AMAZON.CancelIntent intent is supplied', done => {
      sinon.spy(app, 'stop');

      app.intent(
        {
          request: {
            intent: {
              name: 'AMAZON.CancelIntent',
            },
          },
        },
        () => {
          expect(app.stop.calledOnce).to.be.true;
          app.stop.restore();

          done();
        }
      );
    });

    it('should call app.unknownIntent() if an unknown intent is supplied', done => {
      sinon.spy(app, 'unknownIntent');

      app.intent(
        {
          request: {
            intent: {
              name: 'MysteryIntent',
            },
          },
        },
        () => {
          expect(app.unknownIntent.calledOnce).to.be.true;
          app.unknownIntent.restore();

          done();
        }
      );
    });
  });

  describe('#getAirQuality()', () => {
    const buildRequest = city => {
      return {
        request: {
          intent: {
            slots: {
              name: 'GetAirQuality',
              City: {
                value: city,
              },
            },
          },
        },
      };
    };

    it('should return an error in the callback if `defra-air-quality-js` throws an error', done => {
      const stub = sinon.stub(defraJsStub, 'get').returns(Promise.reject({}));

      app.getAirQuality(buildRequest('Reading'), (err, res) => {
        expect(err).to.be.null;
        expect(res.response.outputSpeech.text).to.equal(
          lang.get('unknownError')
        );

        stub.restore();
        done();
      });
    });

    it('should return a successful response in the callback with an invalid city message if no city is supplied', done => {
      app.getAirQuality(buildRequest(undefined), (err, res) => {
        expect(err).to.be.null;
        expect(res.response.outputSpeech.text).to.equal(
          lang.get('invalidCity')
        );

        done();
      });
    });

    it('should return a successful response in the callback with a no matching location message if a matching city is not found', done => {
      app.getAirQuality(buildRequest('Non-existant city'), (err, res) => {
        expect(err).to.be.null;
        expect(res.response.outputSpeech.text).to.equal(
          lang.get('noMatchingLocation', { city: 'Non-existant city' })
        );

        done();
      });
    });

    it('should return a successful response in the callback with a single city message if a single matching city is found', done => {
      app.getAirQuality(buildRequest('Oxford St Ebbes'), (err, res) => {
        expect(err).to.be.null;
        expect(res.response.outputSpeech.text).to.equal(
          `At the Oxford St Ebbes monitoring station, the current pollution level is low at index 1.`
        );

        done();
      });
    });

    it('should return a successful response in the callback with a no value reported message if a single matching city is found but it is not reporting a value', done => {
      app.getAirQuality(buildRequest('London Teddington'), (err, res) => {
        expect(err).to.be.null;
        expect(res.response.outputSpeech.text).to.equal(
          `The monitoring station at London Teddington is currently not reporting an air quality index, please try again later.`
        );

        done();
      });
    });

    it('should return a successful response in the callback with a multi-city message if a multiple matching cities are found', done => {
      app.getAirQuality(buildRequest('Reading'), (err, res) => {
        expect(err).to.be.null;
        expect(res.response.outputSpeech.text).to.equal(
          `At the Reading Central monitoring station, the current pollution level is low at index 2. I have found 1 other station in the location you requested, you might want to try this next time: Reading London Rd.`
        );

        done();
      });
    });
  });
});
