module.exports = {
    name: "admin",
    execute: async (ctx, { config }) => {
        // Check if user is owner
        if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
            return await ctx.reply('⛔ This command is for the bot owner only.');
        }

        const admin =
            `🔧 *Admin Panel*\n\n` +
            `» /pending – View pending orders\n` +
            `» /verify <user_id> – Verify payment and create server\n` +
            `» /ban <user_id> – Ban a user\n` +
            `» /unban <user_id> – Unban a user\n` +
            `» /delserver <server_id> – Delete a server\n` +
            `» /deluser <user_id> – Delete a user and their servers\n` +
            `» /restart – Restart the bot\n\n` +
            `_Use these commands to manage your business._`;
        await ctx.reply(admin);
    }
};