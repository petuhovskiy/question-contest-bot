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
            description: String,
            date: { type: Date, default: Date.now }
        })
        competitionSchema.statics.findActive = function(chatId) {
            return this.findOne({ chatId, active: true }).exec();
        }
        competitionSchema.statics.findLatest = function(chatId) {
            return this.findOne({ chatId })
                        .sort({date: -1})
                        .exec();
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
        answerSchema.methods.displayName = function() {
            if (this.username) {
                return this.username;
            } else {
                return this.fullname;
            }
        }
        answerSchema.statics.findByUserAndCompetition = function(userId, competitionId) {
            return this.findOne({ userId, competitionId }).exec();
        }
        answerSchema.statics.findByCompetition = function(competitionId) {
            return this.find({ competitionId }).exec();
        }
        answerSchema.statics.findByUsername = function(username, competitionId) {
            return this.findOne({ username, competitionId }).exec();
        }
        answerSchema.statics.findByFullname = function(fullname, competitionId) {
            return this.findOne({ fullname, competitionId }).exec();
        }
        this.Answer = mongoose.model('Answer', answerSchema);

        const resultSchema = new Schema({
            chatId: Number,
            userId: Number,
            name: String,
            points: Number
        });
        resultSchema.statics.findByUser = function(chatId, userId) {
            return this.findOne({ chatId, userId }).exec();
        }
        resultSchema.statics.findByChat = function(chatId) {
            return this.find({ chatId }).exec();
        }
        this.Result = mongoose.model('Result', resultSchema);
    }

    saveMessage(msg) {
        new this.Message(msg).save();
    }
}

module.exports = Db