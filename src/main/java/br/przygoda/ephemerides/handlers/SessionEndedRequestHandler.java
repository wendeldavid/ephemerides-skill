package br.przygoda.ephemerides.handlers;

import com.amazon.ask.dispatcher.request.handler.HandlerInput;
import com.amazon.ask.dispatcher.request.handler.RequestHandler;
import com.amazon.ask.model.Response;
import com.amazon.ask.model.SessionEndedRequest;

import java.util.Optional;

import static com.amazon.ask.request.Predicates.requestType;
public class SessionEndedRequestHandler implements RequestHandler  {

    public boolean canHandle(HandlerInput input) {
        return input.matches(requestType(SessionEndedRequest.class));
    }
    public Optional<Response> handle(HandlerInput input) {
        return input.getResponseBuilder().build();
    }
}