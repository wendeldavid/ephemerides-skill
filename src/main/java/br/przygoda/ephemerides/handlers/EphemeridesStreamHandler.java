package br.przygoda.ephemerides.handlers;

import com.amazon.ask.AlexaSkill;
import com.amazon.ask.SkillStreamHandler;
import com.amazon.ask.Skills;
import com.amazon.ask.dispatcher.exception.ExceptionHandler;
import com.amazon.ask.dispatcher.request.handler.HandlerInput;
import com.amazon.ask.model.Response;

import java.util.Optional;

public class EphemeridesStreamHandler extends SkillStreamHandler {

    public EphemeridesStreamHandler() {
        super(getSkill());
    }

    private static AlexaSkill getSkill() {
        return Skills.custom()
                .withSkillId("amzn1.ask.skill.82c8eecb-bafc-4381-a44f-6f7ac929025d")
                .addRequestHandlers(
                        new LaunchRequestHandler(),
                        new HelpIntentHandler(),
                        new SessionEndedRequestHandler(),
                        new CancelIntentHandler(),
                        new StopIntentHandler(),
                        new NavigateHomeIntent(),
                        new EphemeridesIntendHandler()
                )
                .addExceptionHandler(new ExceptionHandler() {
                    @Override
                    public boolean canHandle(HandlerInput handlerInput, Throwable throwable) {
                        return true;
                    }

                    @Override
                    public Optional<Response> handle(HandlerInput handlerInput, Throwable throwable) {
                        throwable.printStackTrace();
                        String speechText = "hmmmm nâo consegui encontrar nada no momento";
                        return handlerInput.getResponseBuilder()
                                .withSpeech(speechText)
                                .withSimpleCard("Efemérides", speechText)
                                .withReprompt(speechText)
                                .build();
                    }
                })
                .build();
    }
}
