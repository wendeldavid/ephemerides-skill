package br.przygoda.ephemerides.handlers;

import br.przygoda.ephemerides.Ephemerides;
import com.amazon.ask.dispatcher.request.handler.HandlerInput;
import com.amazon.ask.dispatcher.request.handler.RequestHandler;
import com.amazon.ask.model.LaunchRequest;
import com.amazon.ask.model.Response;

import java.util.Optional;

import static com.amazon.ask.request.Predicates.requestType;
public class LaunchRequestHandler implements RequestHandler  {

    public boolean canHandle(HandlerInput input) {
        return input.matches(requestType(LaunchRequest.class));
    }
    public Optional<Response> handle(HandlerInput input) {
//        String speechText = "Voce pode dizer, 'o quê aconteceu hoje?'";
        String speechText = Ephemerides.getEphemeride();
        return input.getResponseBuilder()
                .withSpeech(speechText)
                .withSimpleCard("Efemérides", speechText)
                .withReprompt(speechText)
                .build();
    }
}