module.exports = (language) => {
  // Load in the strings for the supplied language
  const strings = require('./' + language);

  // Return an object that returns either the matching string, or the supplied key if no matching string is found
  return {
    get: (key, data) => {
      // If no matching string is found, return the key
      if(typeof strings[key] === 'undefined') {
        return key;
      }

      // Return the matching string
      return strings[key](data);
    }
  }
};