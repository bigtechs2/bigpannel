module.exports = {
    name: "status",
    execute: async (ctx, { db }) => {
        const user = ctx.from;
        const userDb = db.getUser(user.id);

        if (!userDb.servers || userDb.servers.length === 0) {
            return await ctx.reply(
                `📭 *No Servers Found*\n\n` +
                `You don't have any active servers.\n` +
                `Use /buy to purchase one.`
            );
        }

        let msg = `📊 *Your Servers (${userDb.servers.length})*\n\n`;
        userDb.servers.forEach((server, i) => {
            const statusEmoji = server.status === 'active' ? '🟢' : '🔴';
            const remaining = server.expiresAt ? Math.max(0, Math.floor((server.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))) : 'N/A';
            msg += `${i+1}. ${statusEmoji} *${server.plan}*\n`;
            msg += `   › Server ID: ${server.serverId}\n`;
            msg += `   › Status: ${server.status}\n`;
            msg += `   › Days Remaining: ${remaining}\n\n`;
        });

        msg += `_Need help? Use /contact_`;
        await ctx.reply(msg);
    }
};