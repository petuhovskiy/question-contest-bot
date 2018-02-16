require('dotenv').config()

const Db = require('./db')
const View = require('./view')
const Logic = require('./logic')
const Handler = require('./handler')

const TelegramBot = require('node-telegram-bot-api')

const token = process.env.BOT_TOKEN

if (!token) {
    console.error('Token is required!')
    process.exit(1)
}

// init
const bot = new TelegramBot(token, {polling: true})

const db = new Db()
const view = new View(bot)
const logic = new Logic(db, bot, view)
const handler = new Handler(logic, bot)