const trimMessage = require('../utils/trim')

class View {
    constructor(bot) {
        this.bot = bot;
    }

    send(chatId, message) {
        this.bot.sendMessage(
            chatId,
            trimMessage(message)
        );
    }

    reply(msg, message) {
        this.bot.sendMessage(
            msg.chat.id,
            trimMessage(message),
            {
                reply_to_message_id: msg.message_id
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
}

module.exports = View