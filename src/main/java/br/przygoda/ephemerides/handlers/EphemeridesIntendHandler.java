package br.przygoda.ephemerides.handlers;

import br.przygoda.ephemerides.Ephemerides;
import com.amazon.ask.dispatcher.request.handler.HandlerInput;
import com.amazon.ask.dispatcher.request.handler.RequestHandler;
import com.amazon.ask.model.Response;
import com.amazon.ask.request.Predicates;

import java.util.Optional;

public class EphemeridesIntendHandler implements RequestHandler {
    @Override
    public boolean canHandle(HandlerInput handlerInput) {
        return handlerInput.matches(Predicates.intentName("EphemeridesIntent"));
    }

    @Override
    public Optional<Response> handle(HandlerInput handlerInput) {
        String speech = Ephemerides.getEphemeride();
        return handlerInput.getResponseBuilder()
                .withSpeech(speech)
                .withSimpleCard("Efemérides", speech)
                .build();
    }
}
