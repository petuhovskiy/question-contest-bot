const mongoose = require('mongoose')
const Schema = mongoose.Schema

// init

const url = process.env.MONGO_DB;
mongoose.connect(url);

const db = mongoose.connection;

// Activity
const activitySchema = new Schema({
    id: Number,
    chatId: Number,
    plus: Number,
    minus: Number,
    last: Number
});

activitySchema.statics.findByUserId = function(chatId, id) { 
    return this.findOne({ id, chatId }).exec();
}

const Activity = mongoose.model('Activity', activitySchema);

// ReputationChange
const reputationChangeSchema = new Schema({
    id: Number,
    chatId: Number,
    username: String,
    value: Number,
    time: Number
})

reputationChangeSchema.statics.findByUsers = function(chatId, id, username, value) {
    return this
        .find({ chatId, id, username, value })
        .sort({ time: -1 })
        .limit(1)
        .exec()
        .then(arr => arr[0]);
}

reputationChangeSchema.statics.findAll = function() {
    return this.find({}).exec();
}

const ReputationChange = mongoose.model('ReputationChange', reputationChangeSchema);

const reputationSchema = new Schema({
    chatId: Number,
    username: String,
    value: Number,
    plus: Number,
    minus: Number
})

reputationSchema.statics.countReputation = async function(chatId, username) {
    return this.findOne({ chatId, username }).exec();
}

reputationSchema.statics.getStats = function(chatId, sort) {
    return this.find({ chatId }).sort({ value: sort }).exec();
}

reputationSchema.statics.findAll = function() {
    return this.find({}).exec();
}

const Reputation = mongoose.model('Reputation', reputationSchema);

const Message = mongoose.model('Message', new Schema({}, { strict: false }))

const saveMessage = msg => new Message(msg).save()

module.exports = {
    Activity,
    ReputationChange,
    Reputation,
    saveMessage
}