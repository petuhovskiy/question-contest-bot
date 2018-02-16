class Handler {
    constructor(logic, bot) {
        this.logic = logic;
        this.bot = bot;
        this.init();
    }

    isFromAdmin(msg) {
        return this.bot.getChatMember(msg.chat.id, msg.from.id)
            .then(it => it.status == 'administrator' || it.status == 'creator');
    }

    checkAdmin(msg, confirm, deny) {
        this.isFromAdmin(msg).then(it => {
            if (it) confirm();
            else deny();
        });
    }

    user(u) {
        let username = (u.indexOf('@') == 0) ? u.substring(1) : u;
        return {
            username: username.toLowerCase(),
            query: username,
            display: '@' + username
        }
    }

    init() {
        const { bot, logic } = this;

        bot.onText(/\/newcompetition(@\w*)?\s+(\S+)\s+(.*)/, (msg, match) =>
            this.checkAdmin(msg,
                () => logic.newCompetition(msg, match[2], match[3], match),
                () => logic.onAdminAbuse(msg)
            )
        );

        bot.onText(/\/addpoints(@\w*)?\s+([@ \w]+)\s+(\d+)/, (msg, match) =>
            this.checkAdmin(msg,
                () => logic.addPoints(msg, this.user(match[2]), parseInt(match[3]), match),
                () => logic.onAdminAbuse(msg)
            )
        );

        bot.onText(/\/closecompetition(@\w*)?/, (msg, match) =>
            this.checkAdmin(msg,
                () => logic.closeCompetition(msg),
                () => logic.onAdminAbuse(msg)
            )
        );

        bot.onText(/\/answer(@\w*)?\s+(.*)/, (msg, match) => {
            logic.answer(msg, match[2], match);
        });

        bot.onText(/\/showanswers(@\w*)?/, (msg, match) => {
            logic.showAnswers(msg);
        });

        bot.onText(/\/results(@\w*)?/, (msg, match) => {
            logic.results(msg);
        });
        
        bot.on('message', msg => logic.onMessage(msg));
        bot.on('message', msg => {
            if (msg.new_chat_member && msg.new_chat_member.username == process.env.BOT_USERNAME) {
                logic.onChatJoin(msg);
            }
        })
    }
}

module.exports = Handler