# UK Air Quality Alexa Skill

> Alexa skill for reporting the Defra (Department for Environment, Food & Rural Affairs) air quality index

[![Build Status](https://travis-ci.org/chrishutchinson/air-quality-alexa-skill.svg?branch=master)](https://travis-ci.org/chrishutchinson/air-quality-alexa-skill) [![codecov](https://codecov.io/gh/chrishutchinson/air-quality-alexa-skill/branch/master/graph/badge.svg)](https://codecov.io/gh/chrishutchinson/air-quality-alexa-skill)

## Usage

This is a [Serverless](https://serverless.com/) app for AWS Lambda that uses the [`defra-air-quality-js`](https://github.com/chrishutchinson/defra-air-quality-js) library for accessing and parsing Defra XML data.

## Deployment

The skill is deployed to AWS Lambda via Serverless, and can be done by running:

    $ yarn deploy --profile= --deploymentBucket= --stage=[dev] --region=[eu-west-1]

## Testing

The skill contains unit tests that can be run with Jest:

    $ yarn test

Jest will generate code coverage, which can be found in the `/coverage` directory after running the above command.

There are also some dedicated functional tests, which pass sample Alexa JSON into the handler and return the response (this includes making any applicable network requests). This can be run with:

    $ yarn test:functional
