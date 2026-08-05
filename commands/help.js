module.exports = {
    name: "help",
    execute: async (ctx) => {
        const help =
            `❓ *bigpannel Help*\n\n` +
            `» /start – Start the bot\n` +
            `» /plans – View server plans\n` +
            `» /buy – Purchase a server\n` +
            `» /status – Your server status\n` +
            `» /myservers – List all your servers\n` +
            `» /contact – Contact support\n` +
            `» /help – This help message\n\n` +
            `*Direct Create Commands:*\n` +
            `» /1gb, /2gb, ... /10gb – Create specific plan\n` +
            `» /unli – Create unlimited server\n\n` +
            `*Admin Commands:*\n` +
            `» /verify <user_id> – Verify payment\n` +
            `» /pending – View pending orders\n` +
            `» /ban <user_id> – Ban user\n` +
            `» /unban <user_id> – Unban user\n` +
            `» /delserver <server_id> – Delete server\n` +
            `» /deluser <user_id> – Delete user\n` +
            `» /restart – Restart the bot`;
        await ctx.reply(help);
    }
};