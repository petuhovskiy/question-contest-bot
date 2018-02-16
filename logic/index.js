const Queue = require('../utils/queue')

class AsyncLogic {
    constructor(db, bot, view) {
        this.db = db;
        this.bot = bot;
        this.view = view;
    }

    async newCompetition(msg, name, desc) {
        await this.closeCompetition(msg.chat.id);
        const competition = new this.db.Competition({
            chatId: msg.chat.id,
            creator: msg.from.id,
            active: true,
            name,
            description: desc
        });
        await competition.save();
        this.view.newCompetiton(competition);
    }

    async closeCompetition(chatId) {
        const competition = await this.db.Competition.findActive(chatId);
        if (competition != null) {
            competition.active = false;
            await competition.save();
            this.view.closeCompetition(competition, await this.db.Answer.findByCompetition(competition._id));
        }
        return competition;
    }

    async answer(msg, answer) {
        const competition = await this.db.Competition.findActive(msg.chat.id);
        if (competition == null) {
            this.view.noActiveCompetition(msg);
            return;
        }
        let dbAnswer = await this.db.Answer.findByUserAndCompetition(msg.from.id, competition._id);
        if (dbAnswer == null) {
            dbAnswer = new this.db.Answer({
                chatId: msg.chat.id,
                username: msg.from.username,
                userId: msg.from.id,
                fullname: msg.from.first_name + ' ' + msg.from.last_name,
                answer,
                competitionId: competition._id
            });
            await dbAnswer.save();
            this.view.replyAnswer(msg, dbAnswer.toObject());
        } else {
            const lastAnswer = dbAnswer.toObject();
            dbAnswer.answer = answer;
            dbAnswer.date = Date.now();
            dbAnswer.username = msg.from.username;
            dbAnswer.fullname = msg.from.first_name + ' ' + msg.from.last_name;
            await dbAnswer.save();
            this.view.replyAnswer(msg, dbAnswer.toObject(), lastAnswer);
        }
    }

    async showAnswers(chatId) {
        const competition = await this.db.Competition.findActive(chatId);
        if (competition == null) {
            this.view.noActiveCompetition(msg);
            return;
        }
        this.view.showAnswers(competition, await this.db.Answer.findByCompetition(competition._id))
    }

    async addPoints(msg, user, points) {
        
    }

    async results(chatId) {
        // const competition = await this.db.Competition.findActive(msg.chat.id); // TODO
        // if (competition == null) {
        //     this.view.noActiveCompetition(msg);
        //     return;
        // }
    }
}

class Logic {
    constructor(db, bot, view) {
        this.db = db;
        this.bot = bot;
        this.view = view;
        this.queue = new Queue();
        this.async = new AsyncLogic(db, bot, view);
    }

    onMessage(msg) {
        console.log(msg);
        this.db.saveMessage(msg);
    }

    onChatJoin(msg) {
        this.view.sendJoinMessage(msg.chat.id);
    }

    onAdminAbuse(msg) {
        this.view.replyAdminRequired(msg);
    }

    newCompetition(msg, name, desc) {
        this.queue.add(() => this.async.newCompetition(msg, name, desc));
    }

    closeCompetition(msg) {
        this.queue.add(() => this.async.closeCompetition(msg.chat.id));
    }

    addPoints(msg, user, points) {
        this.queue.add(() => this.async.addPoints(msg, user, points));
    }

    answer(msg, answer) {
        this.queue.add(() => this.async.answer(msg, answer));
    }

    showAnswers(msg) {
        this.queue.add(() => this.async.showAnswers(msg.chat.id));
    }

    results(msg) {
        this.queue.add(() => this.async.results(msg.chat.id));
    }
}

module.exports = Logic