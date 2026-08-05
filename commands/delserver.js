module.exports = {
    name: "delserver",
    execute: async (ctx, { config, ptero }) => {
        const isOwner = ctx.from.id.toString() === config.telegram.ownerId.toString();

        if (!isOwner) {
            return await ctx.reply('⛔ Only the bot owner can delete servers.');
        }

        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return await ctx.reply(
                `*Usage:* /delserver <server_id>\n` +
                `Example: /delserver 12345`
            );
        }

        const serverId = args[1];

        try {
            await ptero.deleteServer(serverId);
            await ctx.reply(`✅ *Server ${serverId} deleted successfully!*`);
        } catch (error) {
            await ctx.reply(`❌ Failed to delete server: ${error.message}`);
        }
    }
};