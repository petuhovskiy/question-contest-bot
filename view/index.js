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

    sendJoinMessage(chatId) {
        this.send(chatId, `
            onJoinMessage
        `);
    }

    replyAdminRequired(msg) {
        this.reply(msg, `
            Вы должны иметь права администратора для выполнения данной команды!
        `);
    }

    closeCompetition(competition, answers) {
        this.send(competition.chatId, `
            Конкурс завершен!
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
}

module.exports = View