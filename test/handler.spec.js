// Import chai.
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Tell chai that we'll be using the "should" style assertions.
const should = chai.should();

const mainStub = {
  launch: (callback) => {
    callback();
  },

  intent: (event, callback) => {
    callback();
  }
}

const envStub = {
  applicationId: 'sample-application-id'
};

const handler = proxyquire('../handler', {
  './.env.json': envStub,
  './app/main': mainStub
});

describe('handler', () => {
  
  describe('#quality()', () => {

    it('should return an error in the callback if the event is invalid', (done) => {
      handler.quality(null, {}, err => {
        err.should.equal('Request made from invalid application');
        done();
      });
    });

    it('should return an error in the callback if the event is invalid #2', (done) => {
      handler.quality({}, {}, err => {
        err.should.equal('Request made from invalid application');
        done();
      });
    });

    it('should return a null error in the callback if the event is valid', (done) => {
      handler.quality({
        session: {
          application: {
            applicationId: 'sample-application-id'
          }
        },
        request: {
          type: ''
        }
      }, {}, err => {
        should.equal(err, null);
        done();
      });
    });

    it('should call `app.launch` when a LaunchRequest is made', (done) => {
      sinon.spy(mainStub, 'launch');
      sinon.spy(mainStub, 'intent');

      handler.quality({
        session: {
          application: {
            applicationId: 'sample-application-id'
          }
        },
        request: {
          type: 'LaunchRequest'
        }
      }, {}, () => {
        mainStub.launch.calledOnce.should.be.true;
        mainStub.intent.notCalled.should.be.true;
        mainStub.launch.restore();
        mainStub.intent.restore();

        done();
      });
    });

    it('should call `app.intent` when a IntentRequest is made', (done) => {
      sinon.spy(mainStub, 'launch');
      sinon.spy(mainStub, 'intent');

      handler.quality({
        session: {
          application: {
            applicationId: 'sample-application-id'
          }
        },
        request: {
          type: 'IntentRequest'
        }
      }, {}, () => {
        mainStub.intent.calledOnce.should.be.true;
        mainStub.launch.notCalled.should.be.true;
        mainStub.intent.restore();
        mainStub.launch.restore();

        done();
      });

    });

    it('should not call any methods when a SessionEndedRequest is made', (done) => {
      sinon.spy(mainStub, 'launch');
      sinon.spy(mainStub, 'intent');

      handler.quality({
        session: {
          application: {
            applicationId: 'sample-application-id'
          }
        },
        request: {
          type: 'SessionEndedRequest'
        }
      }, {}, () => { });
      mainStub.intent.notCalled.should.be.true;
      mainStub.launch.notCalled.should.be.true;
      mainStub.intent.restore();
      mainStub.launch.restore();

      done();

    });

  });

});