package br.przygoda.ephemerides.handlers;

import com.amazon.ask.dispatcher.request.handler.HandlerInput;
import com.amazon.ask.dispatcher.request.handler.RequestHandler;
import com.amazon.ask.model.Response;

import java.util.Optional;

import static com.amazon.ask.request.Predicates.intentName;

public class StopIntentHandler implements RequestHandler {

    public boolean canHandle(HandlerInput input) {
        return input.matches(intentName("AMAZON.StopIntent"));
    }
    public Optional<Response> handle(HandlerInput input) {
        String speechText = "Ok, não falarei mais nada";
        return input.getResponseBuilder()
                .withSpeech(speechText)
                .withSimpleCard("e", speechText)
                .withReprompt(speechText)
                .build();
    }
}
