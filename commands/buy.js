const { Markup } = require('telegraf');

module.exports = {
    name: "buy",
    execute: async (ctx, { db, config }) => {
        const user = ctx.from;
        const userDb = db.getUser(user.id);

        if (userDb.banned) {
            return await ctx.reply('⛔ You have been banned from using this bot.');
        }

        let msg = `💰 *Buy a Server*\n\n`;
        msg += `Select a plan below:\n\n`;

        const plans = config.plans;
        const buttons = [];
        const cols = 3;

        for (let i = 0; i < plans.length; i++) {
            const label = plans[i].name === 'Unlimited' ? '♾️' : plans[i].name;
            buttons.push(Markup.button.callback(label, `buy_plan_${i}`));
        }

        const rows = [];
        for (let i = 0; i < buttons.length; i += cols) {
            rows.push(buttons.slice(i, i + cols));
        }

        await ctx.reply(msg, Markup.inlineKeyboard(rows));
    }
};