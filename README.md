# UK Air Quality Alexa Skill

> Alexa skill for reporting the Defra (Department for Environment, Food & Rural Affairs) air quality index

[![Build Status](https://travis-ci.org/chrishutchinson/air-quality-alexa-skill.svg?branch=master)](https://travis-ci.org/chrishutchinson/air-quality-alexa-skill)  [![codecov](https://codecov.io/gh/chrishutchinson/air-quality-alexa-skill/branch/master/graph/badge.svg)](https://codecov.io/gh/chrishutchinson/air-quality-alexa-skill)

## Usage

This is a [Serverless](https://serverless.com/) app for AWS Lambda that uses the [`defra-air-quality-js`](https://github.com/chrishutchinson/defra-air-quality-js) library for accessing and parsing Defra XML data.

For Lambda, `handler.js` handles core requests and passes them to the main app in `app/main.js`. You can run this locally without Lambda by using the `tester.js`. Build an Alexa JSON object in that file, and run it as follows:

    $ node tester.js


## Deployment

The skill is deployed to AWS Lambda via Serverless, and can be done by running:

    $ npm run deploy


## Testing

The skill contains unit tests that can be run with Mocha:

    $ npm run test

Istanbul will generate code coverage, which can be found in the `/coverage` directory after running the above command.