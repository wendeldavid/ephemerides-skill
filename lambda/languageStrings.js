/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    pt: {
        translation: {
            SKILL_NAME: 'Efemérides',
            HELP_MESSAGE: 'Efeméride é um fato histórico. Você pode pedir para eu contar uma que aconteceu no dia de hoje, e eu irei procurar alguma para contar.',
            HELP_REPROMPT: 'O que deseja saber?',
            FALLBACK_MESSAGE: 'Estou tendo algum problema, não consegui achar nos meus registros nenhum fato relevante. Gostaria de saber mais?',
            FALLBACK_REPROMPT: 'Eu posso contar algum fato hisórico. Gostaria de saber algum?',
            ERROR_MESSAGE: 'Desculpe, algo deu errado.',
            STOP_MESSAGE: 
            [
                'Tchau!',
                'Até',
                'Até a próxima',
                'Vou sentir saudades',
                'ahhhh tinha outra legal pra contar. Mas vou deixar para a próxima.',
                'Espero tenha gostado.'
            ],
            REPROMPT:
            [
                'Você gostaria de saber outro fato histórico?',
                'Se você quiser, posso contar outro.',
                'Deseja saber mais?',
                'Posso contar outro?',
                'Se você quiser saber mais um, basta pedir.',
            ],
        }
    }
}