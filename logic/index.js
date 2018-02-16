class Logic {
    constructor(db, bot, view) {
        this.db = db;
        this.bot = bot;
        this.view = view;
    }

    onMessage(msg) {
        console.log(msg);
    }

    onChatJoin(msg) {
        this.view.sendJoinMessage(msg.chat.id);
    }

    onAdminAbuse(msg) {
        this.view.replyAdminRequired(msg);
    }

    newCompetition(msg, name, desc) {
        this.view.reply(msg, ['newcompetition', name, desc] + '');
    }

    addPoints(msg, user, points) {
        this.view.reply(msg, ['addpoints', user, points] + '');
    }

    closeCompetition(msg) {
        this.view.reply(msg, 'closecompetition');
    }

    answer(msg, answer) {
        this.view.reply(msg, ['answer', answer] + '');
    }

    showAnswers(msg) {
        this.view.reply(msg, 'showanswers');
    }

    results(msg) {
        this.view.reply(msg, 'results');
    }
}

module.exports = Logic