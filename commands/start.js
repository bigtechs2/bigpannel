module.exports = {
    name: "start",
    execute: async (ctx, { config }) => {
        const user = ctx.from;
        const greeting = `Welcome to bigpannel! 🖥️`;

        await ctx.reply(
            `${greeting}\n\n` +
            `» *Server Hosting Plans:* 1GB – Unlimited\n` +
            `» *Price:* Starting from 1,500 TZS\n` +
            `» *Features:* Full root access, 24/7 support\n\n` +
            ` /plans – View all plans\n` +
            ` /buy – Purchase a server\n` +
            ` /status – Your server status\n` +
            ` /contact – Contact support\n` +
            ` /help – Help & FAQ\n\n` +
            `_${config.footer || '© bigpannel by bigmanjtech™'}_`
        );
    }
};