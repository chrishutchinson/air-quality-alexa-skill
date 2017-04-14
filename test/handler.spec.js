// Import chai.
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Tell chai that we'll be using the "should" style assertions.
const expect = chai.expect;

const mainStub = {
  launch: () => {},
  intent: () => {},
};

const configStub = {
  alexaApplicationId: 'sample-application-id',
};

const handler = proxyquire('../handler', {
  './config': configStub,
  './app/main': mainStub,
});

describe('handler', () => {
  describe('#quality()', () => {
    it('should return an error in the callback if the event is invalid', done => {
      handler.quality(null, {}, err => {
        expect(err).to.equal('Request made from invalid application');
        done();
      });
    });

    it('should return an error in the callback if the event is invalid #2', done => {
      handler.quality({}, {}, err => {
        expect(err).to.equal('Request made from invalid application');
        done();
      });
    });

    it('should return an error in the callback if the event is invalid #3', done => {
      handler.quality(
        {
          session: {
            application: {
              applicationId: 'invalid-application-id',
            },
          },
          request: {
            type: '',
          },
        },
        {},
        err => {
          expect(err).to.equal('Request made from invalid application');
          done();
        }
      );
    });

    it('should return a null error in the callback if the event is valid', done => {
      handler.quality(
        {
          session: {
            application: {
              applicationId: 'sample-application-id',
            },
          },
          request: {
            type: '',
          },
        },
        {},
        err => {
          expect(err).to.be.null;
          done();
        }
      );
    });

    it('should call `app.launch` when a LaunchRequest is made', () => {
      sinon.spy(mainStub, 'launch');
      sinon.spy(mainStub, 'intent');

      handler.quality(
        {
          session: {
            application: {
              applicationId: 'sample-application-id',
            },
          },
          request: {
            type: 'LaunchRequest',
          },
        },
        {},
        () => {}
      );

      expect(mainStub.launch.calledOnce).to.be.true;
      expect(mainStub.intent.notCalled).to.be.true;
      mainStub.launch.restore();
      mainStub.intent.restore();
    });

    it('should call `app.intent` when a IntentRequest is made', () => {
      sinon.spy(mainStub, 'launch');
      sinon.spy(mainStub, 'intent');

      handler.quality(
        {
          session: {
            application: {
              applicationId: 'sample-application-id',
            },
          },
          request: {
            type: 'IntentRequest',
          },
        },
        {},
        () => {}
      );

      expect(mainStub.intent.calledOnce).to.be.true;
      expect(mainStub.launch.notCalled).to.be.true;
      mainStub.intent.restore();
      mainStub.launch.restore();
    });

    it('should not call any methods when a SessionEndedRequest is made', () => {
      sinon.spy(mainStub, 'launch');
      sinon.spy(mainStub, 'intent');

      handler.quality(
        {
          session: {
            application: {
              applicationId: 'sample-application-id',
            },
          },
          request: {
            type: 'SessionEndedRequest',
          },
        },
        {},
        () => {}
      );

      expect(mainStub.intent.notCalled).to.be.true;
      expect(mainStub.launch.notCalled).to.be.true;
      mainStub.intent.restore();
      mainStub.launch.restore();
    });
  });
});
