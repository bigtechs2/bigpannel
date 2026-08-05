const { Markup } = require('telegraf');

async function getPlansMessage(ctx, config) {
    const plans = config.plans;
    let msg = ` *Server Plans (Monthly)*\n\n`;

    plans.forEach((plan, i) => {
        const ram = plan.ram === 0 ? '∞' : `${plan.ram} MB`;
        const disk = plan.disk === 0 ? '∞' : `${plan.disk} MB`;
        const cpu = plan.cpu === 0 ? '∞' : `${plan.cpu}%`;
        msg += `${i+1}. › *${plan.name}*\n`;
        msg += `   › RAM: ${ram} | CPU: ${cpu}\n`;
        msg += `   › Disk: ${disk} | Price: ${plan.price.toLocaleString()} ${plan.currency}\n\n`;
    });

    msg += `_Select a plan to buy._`;

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

module.exports = {
    name: "plans",
    execute: async (ctx, { config }) => {
        await getPlansMessage(ctx, config);
    }
};

module.exports.getPlansMessage = getPlansMessage;