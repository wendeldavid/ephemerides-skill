/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./languageStrings');
const https = require('https');

const { parse } = require('node-html-parser');

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

var events = [];
var births = [];
var deaths = [];
var holydays = [];

var context = [];

const extractTitle = function(el) {
  return el.querySelector('.mw-headline').innerHTML;
}

const extractEphemerideText = function(el) {
  var result = el.rawText;


  result = result.split('\n').join(' ')
  

  return result;
}

const extractText = function(el) {
  const nodes = el.querySelectorAll('li');

  const ctx = context[context.length - 1];

  for (var i = 0; i < nodes.length; i++) {
    const item = nodes[i];

    if ('Eventos históricos' === ctx) {
      events.push('Hoje em ' + extractEphemerideText(item));
    } else if ('Nascimentos' === ctx) {
      births.push('Aniversário de nascimento ' + extractEphemerideText(item).replace('\(m\.', ', morto em ').replace(')', ''));
    } else if ('Mortes' === ctx) {
      deaths.push('Aniversário de morte ' + extractEphemerideText(item).replace('\(n\.', ', nascido em ').replace(')', ''));
    } else if ('Feriados e eventos cíclicos' === ctx) {
      holydays.push(extractEphemerideText(item));
    }
  }
}

const randomEphemerides = function() {
  const ephemerides = [].concat(events).concat(births).concat(deaths).concat(holydays);

  const index = Math.floor(Math.random() * ephemerides.length);

  return ephemerides[index];
}

const getEphemerides = async function(day, month) {
  const rawPage = await readPage(day, month);

  var page = parse(rawPage);

  page = page.querySelector('.mw-parser-output');

  for (var i = 0; i < page.childNodes.length; i++) {
    const el = page.childNodes[i];

    if ('h2' === el.tagName) {
      const title = extractTitle(el);

      if (!!context.length) {
        context.pop();
      }

      context.push(title);

    } else if ('ul' === el.tagName) {
      extractText(el);
    }

  }

  // console.log('events');
  // console.log(events);

  // console.log('burths');
  // console.log(births);

  // console.log('deaths');
  // console.log(deaths);

  // console.log('holydays');
  // console.log(holydays);

  return randomEphemerides();
}

const readPage = function(day, month) {
  const reqOptions = {
      hostname: 'pt.wikipedia.org',
      path: '/wiki/' + day + '_de_' + MONTHS[month],
      method: 'GET'
  };

  console.log('reading ' + reqOptions.path);

  return new Promise((resolve, reject) => {
      const covidReq = https.request(reqOptions, (response) => {
          const chunks = [];
          response.on('data', (data) => {
              // console.log('data');
              chunks.push(data);
          });
          response.on('end', (end) => {
              const responseString = chunks.join('');
              // console.log('end');
              // console.log(responseString);
              resolve(responseString);
          });
      });
      
      covidReq.on('error', (error) => {
          console.log('read ephemerides error');
          console.log(error);
          reject(error);
      });

      covidReq.end();
  });
}

const getToday = function() {
  const today = new Date();

  const day = today.getDate();
  const month = today.getUTCMonth();

  return {
    day: day,
    month: month
  };
}

const getEphemeride = async function(handlerInput) {
  const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const responseBuilder = handlerInput.responseBuilder;
      
    const date = getToday();

    try {
        const ephemeridesCall = getEphemerides(date.day, date.month);
        const ephemerides = await ephemeridesCall;
        
        if (!ephemerides || ephemerides.length === 0) {
            return responseBuilder
                .speak('Desculpe, não consigo lembrar de nada no momento')
                .getResponse();
        }

        return responseBuilder
            .speak(ephemerides)
            .reprompt('Você gostaria de saber outro fato histórico?')
            .getResponse();
        
        
    } catch (err) {
      console.log(`Error processing events request: ` + err);
      return responseBuilder
        .speak(requestAttributes.t('ERROR_MESSAGE'))
        .getResponse();
    }
}

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const EphemerideHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ephemeride';
  },
  async handle(handlerInput) {
    return getEphemeride(handlerInput);
  }
};

const HomeHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.NavigateHomeIntent');
  },
  async handle(handlerInput) {
    return getEphemeride(handlerInput);
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    // GetNewFactHandler,
    HomeHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
    
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();
