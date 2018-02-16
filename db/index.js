const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const url = process.env.MONGO_DB;
mongoose.connect(url);

const db = mongoose.connection;

class Db {
    constructor() {
        this.Message = mongoose.model(
            'Message',
            new Schema({}, { strict: false })
        )

        const competitionSchema = new Schema({
            chatId: Number,
            creator: Number,
            active: Boolean,
            name: String,
            description: String
        })
        competitionSchema.statics.findActive = function(chatId) {
            return this.findOne({ chatId, active: true }).exec();
        }
        this.Competition = mongoose.model('Competiton', competitionSchema);
        
        const answerSchema = new Schema({
            chatId: Number,
            username: String,
            userId: Number,
            fullname: String,
            answer: String,
            date: { type: Date, default: Date.now },
            points: { type: Number, default: 0 },
            competitionId: ObjectId
        })
        answerSchema.statics.findByUserAndCompetition = function(userId, competitionId) {
            return this.findOne({ userId, competitionId }).exec();
        }
        answerSchema.statics.findByCompetition = function(competitionId) {
            return this.find({ competitionId }).exec();
        }
        this.Answer = mongoose.model('Answer', answerSchema);

        const resultSchema = new Schema({
            chatId: Number,
            userId: Number,
            displayName: String,
            points: Number
        });
        this.Result = mongoose.model('Result', resultSchema);
    }

    saveMessage(msg) {
        new this.Message(msg).save();
    }
}

module.exports = Db