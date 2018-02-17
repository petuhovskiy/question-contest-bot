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
        let username = msg.from.username;
        if (username != null) {
            username = username.toLowerCase();
        }
        const fullname = msg.from.first_name + ' ' + msg.from.last_name;
        let dbAnswer = await this.db.Answer.findByUserAndCompetition(msg.from.id, competition._id);
        if (dbAnswer == null) {
            dbAnswer = new this.db.Answer({
                chatId: msg.chat.id,
                username,
                userId: msg.from.id,
                fullname,
                answer,
                competitionId: competition._id
            });
            await dbAnswer.save();
            this.view.replyAnswer(msg, dbAnswer.toObject());
        } else {
            const lastAnswer = dbAnswer.toObject();
            dbAnswer.answer = answer;
            dbAnswer.date = Date.now();
            dbAnswer.username = username;
            dbAnswer.fullname = fullname;
            await dbAnswer.save();
            this.view.replyAnswer(msg, dbAnswer.toObject(), lastAnswer);
        }
    }

    async showAnswers(msg) {
        const competition = await this.db.Competition.findLatest(msg.chat.id);
        if (competition == null) {
            this.view.noActiveCompetition(msg);
            return;
        }
        this.view.showAnswers(competition, await this.db.Answer.findByCompetition(competition._id))
    }

    async addPointsToUser(chatId, userId, name, points) {
        let result = await this.db.Result.findByUser(chatId, userId);
        if (result == null) {
            result = new this.db.Result({
                chatId,
                userId,
                name,
                points
            })
        } else {
            result.points += points;
            result.name = name;
        }
        await result.save();
    }

    async addPoints(msg, user, points) {
        const competition = await this.db.Competition.findLatest(msg.chat.id);
        if (competition == null) {
            this.view.noActiveCompetition(msg);
            return;
        }
        let answer = await this.db.Answer.findByUsername(user.username, competition._id);
        if (answer == null) {
            answer = await this.db.Answer.findByFullname(user.query, competition._id);
        }
        if (answer == null) {
            this.view.noUserFound(msg);
            return;
        }
        await this.addPointsToUser(msg.chat.id, answer.userId, answer.username ? answer.username : answer.fullname, points);
        answer.points += points;
        await answer.save();
        this.view.addPoints(answer, points);
    }

    async results(chatId) {
        const competition = await this.db.Competition.findLatest(chatId);
        let answers;
        if (competition == null) {
            answers = null;
        } else {
            answers = await this.db.Answer.findByCompetition(competition._id);
            answers.sort((a, b) => {
                return b.points - a.points;
            });
        }
        const results = await this.db.Result.findByChat(chatId);
        results.sort((a, b) => {
            return b.points - a.points;
        })
        this.view.results(chatId, answers, results);
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

    help(msg) {
        this.view.sendHelpMessage(msg.chat.id);
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
        this.queue.add(() => this.async.showAnswers(msg));
    }

    results(msg) {
        this.queue.add(() => this.async.results(msg.chat.id));
    }
}

module.exports = Logic