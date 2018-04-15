module.exports = {
  launch: () =>
    `You can ask for the latest air quality data for your location, like so: "Alexa, ask Air Quality for an update". You can also ask by providing a specific location, like so: "Alexa, ask Air Quality about air quality in Liverpool". If you need more details on the air quality index, ask: "Alexa, ask Air Quality what the air quality index scale is".`,

  description: () =>
    `This description is from the Department for Environment Food and Rural Affairs website. The Daily Air Quality Index tells you about levels of air pollution and provides recommended actions and health advice. The index is numbered 1 to 10 and divided into four bands, low (1) to very high (10), to provide detail about air pollution levels in a simple way, similar to the sun index or pollen index.`,

  help: () =>
    `This Alexa skill provides Defra air quality data for locations around the UK using the air quality index scale. You can ask for the latest air quality data for your location, like so: "Alexa, ask Air Quality for an update". You can also ask by providing a specific location, like so: "Alexa, ask Air Quality about air quality in Liverpool". If the skill finds multiple stations in the location you provide, it will list them after giving a response, allowing you to ask for the air quality at a more specific location. If you need more details on the air quality index, ask: "Alexa ask Air Quality what the air quality index scale is". So, how can I help?`,

  unknownIntent: () =>
    `I'm sorry, I didn't understand that. You can ask for the latest air quality data for your location, like so: "Alexa, ask Air Quality for an update". You can also ask by providing a specific location, like so: "Alexa, ask Air Quality about air quality in Liverpool". If you need more details on the air quality index, ask: "Alexa ask Air Quality what the air quality index scale is".`,

  invalidCity: () =>
    `Please provide a city or location to check the air quality for. For example: "Ask air quality what is the air quality today in Liverpool".`,

  noMatchingLocation: data =>
    `I'm sorry, I couldn't find any monitoring stations in ${data.city}.`,

  locationNotReporting: data =>
    `The monitoring station at ${
      data.city
    } is currently not reporting an air quality index, please try again later.`,

  locationReport: data =>
    `At the ${data.city} monitoring station, the ${data.text.toLowerCase()}.`,

  additionalLocations: data => {
    const count = data.locations.length;
    const station = count === 1 ? "station" : "stations";
    const nextTime =
      count === 1 ? "this next time:" : "one of these next time:";

    const otherLocations = [
      data.locations.slice(0, -1).join(", "),
      data.locations.slice(-1)[0]
    ].join(count < 2 ? "" : " and ");

    return `I have found ${count} other ${station} in the location you requested, you might want to try ${nextTime} ${otherLocations}`;
  },

  unknownError: () =>
    `I'm sorry, I'm not able to access DEFRA's Air Quality data right now, please try again later.`,

  requestFurtherPermissions: () =>
    `To ask for Air Quality data by postcode, you must grant additional permissions. Please check the Alexa app, where you can grant these, and try asking again. If you choose not to grant these permissions, you can still ask for air quality data, but must ask for a specific location, like so: "Alexa ask Air Quality what is it like today in Liverpool".`
};
