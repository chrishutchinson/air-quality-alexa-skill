const strings = {
  launch: (data) => `You can ask for the latest air quality data for a given location, like so: "Alexa ask Air Quality what the air quality is today in Liverpool". If you need more details on the air quality index, ask: "Alexa ask Air Quality what the air quality index scale is".`,

  description: (data) => `This description is from the Department for Environment Food and Rural Affairs website. The Daily Air Quality Index tells you about levels of air pollution and provides recommended actions and health advice. The index is numbered 1 to 10 and divided into four bands, low (1) to very high (10), to provide detail about air pollution levels in a simple way, similar to the sun index or pollen index.`,

  invalidCity: (data) => `Please provide a city or location to check the air quality for. For example: "Ask air quality what is the air quality today in Liverpool".`,

  noMatchingLocation: (data) => `I'm sorry, I couldn't find any monitoring stations in ${data.city}.`
};

module.exports = {
  get: (key, data) => {
    if(typeof strings[key] === 'undefined') {
      return key;
    }

    return strings[key](data);
  }
};