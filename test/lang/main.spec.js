// Import chai.
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = chai.expect;

const enStub = {
  someString: data => `This is my string`,
  someStringWithData: data =>
    `This is my string, and your name is ${data.name}`,
};

const lang = proxyquire('../../app/lang/main', {
  './en': enStub,
});

describe('lang', () => {
  describe('#()', () => {
    it('should return an object', () => {
      expect(lang('en')).to.be.an('object');
      expect(lang('en').get).to.be.a('function');
    });
  });

  describe('#get()', () => {
    let testLang;

    beforeEach(() => {
      testLang = lang('en');
    });

    it('should return the original key if the string is not found', () => {
      expect(testLang.get('invalid-lang-string')).to.equal(
        'invalid-lang-string'
      );
    });

    it('should return the string based on the key if it is found', () => {
      expect(testLang.get('someString')).to.equal('This is my string');
    });

    it('should pass the data into the string', () => {
      expect(testLang.get('someStringWithData', { name: 'Chris' })).to.equal(
        'This is my string, and your name is Chris'
      );
    });
  });
});
