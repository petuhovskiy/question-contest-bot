const trimMessage = require('../utils/trim')
const dateformat = require('dateformat')

class View {
    constructor(bot) {
        this.bot = bot;
    }

    send(chatId, message) {
        this.bot.sendMessage(
            chatId,
            trimMessage(message),
            { parse_mode: "HTML" }
        );
    }

    reply(msg, message) {
        this.bot.sendMessage(
            msg.chat.id,
            trimMessage(message),
            {
                reply_to_message_id: msg.message_id,
                parse_mode: "HTML"
            }
        );
    }

    helpMessage() {
        return trimMessage(`Команды администратора:
            /newcompetition [название] [описание] - Начать новый конкурс
            /closecompetition - Завершить конкурс
            /addpoints @username [очки] - Добавить очки за ответ

            Команды пользователя:
            /answer [ответ] - Ответить на вопрос конкурса
            /showanswers -  Показать ответы участников
            /result - Показать таблицу результатов`);
    }

    sendHelpMessage(chatId) {
        this.send(chatId, this.helpMessage());
    }

    sendJoinMessage(chatId) {
        this.send(chatId, `
            ${process.env.JOIN_MESSAGE}
        
            ${this.helpMessage()}
        `);
    }

    replyAdminRequired(msg) {
        this.reply(msg, `
            Вы должны иметь права администратора для выполнения данной команды!
        `);
    }

    closeCompetition(competition, answers) {
        this.send(competition.chatId, `
            Прием ответов завершен!
            ${this.competitionText(competition)}

            ${this.answersText(answers)}
        `)
    }

    answersText(answers) {
        return answers.map(it => this.answerText(it)).join('\n');
    }

    answerText(answer) {
        let user = answer.username;
        if (user == null) {
            user = answer.fullname;
        }
        return `[${this.dateText(answer.date)}] <i>${answer.answer}</i> от <b>${user}</b>`;
    }

    dateText(date) {
        return dateformat(date, 'yyyy-mm-dd HH:MM:ss');
    }

    competitionText(competition) {
        return `<b>${competition.name}</b>\n<i>${competition.description}</i>`
    }

    newCompetiton(competition) {
        this.send(competition.chatId, `
            Новый конкурс!
            ${this.competitionText(competition)}
        `)
    }

    noActiveCompetition(msg) {
        this.reply(msg, `
            Нету активных конкурсов!
        `)
    }

    replyAnswer(msg, newAnswer, lastAnswer) {
        this.reply(msg, `
            Новый ответ:
            ${this.answerText(newAnswer)}
            ${lastAnswer != null ? '\nПредыдущий ответ:\n' + this.answerText(lastAnswer) : ''}
        `)
    }

    showAnswers(competition, answers) {
        this.send(competition.chatId, `
            Ответы на текущий конкурс
            ${this.competitionText(competition)}

            ${this.answersText(answers)}
        `)
    }

    noUserFound(msg) {
        this.reply(msg, `
            Не удалось найти такого пользователя!
        `)
    }

    addPoints(answer, points) {
        this.send(answer.chatId, `
            Добавлено ${points} очков за ответ:
            ${this.answerText(answer)}
        `)
    }

    resultsAnswersText(answers) {
        return answers
            .map(it => `${it.points} очков <b>${it.displayName()}</b> за ответ: <i>${it.answer}</i>`)
            .join('\n');
    }

    results(chatId, answers, results) {
        let num = 0;
        this.send(chatId, `
            ${answers ? 'Результаты последнего конкурса:\n' + this.resultsAnswersText(answers) : ''}

            Общие результаты:
            ${results.map(it => `${++num}. <b>${it.name}</b> (${it.points} очков)`).join('\n')}
        `)
    }
}

module.exports = View