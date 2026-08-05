const { Markup } = require('telegraf');

module.exports = {
    name: "myservers",
    execute: async (ctx, { db, config }) => {
        const user = ctx.from;
        const isOwner = user.id.toString() === config.telegram.ownerId.toString();
        const userDb = db.getUser(user.id);

        let servers = [];

        if (isOwner) {
            // Owner sees all servers from all users
            const allUsers = db.getAllUsers();
            for (const [userId, data] of Object.entries(allUsers)) {
                if (data.servers) {
                    data.servers.forEach(s => {
                        servers.push({ ...s, userId });
                    });
                }
            }
        } else {
            servers = userDb.servers || [];
        }

        if (servers.length === 0) {
            return await ctx.reply(
                `📭 *No Servers Found*\n\n` +
                (isOwner ? 'No servers created yet.' : 'You don\'t have any active servers.\nUse /buy to purchase one.')
            );
        }

        let msg = `📊 *Servers (${servers.length})*\n\n`;
        servers.forEach((server, i) => {
            const statusEmoji = server.status === 'active' ? '🟢' : '🔴';
            const remaining = server.expiresAt ? Math.max(0, Math.floor((server.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))) : 'N/A';
            msg += `${i+1}. ${statusEmoji} *${server.plan}*\n`;
            if (isOwner) {
                msg += `   › User: ${server.userId || 'N/A'}\n`;
            }
            msg += `   › Server ID: ${server.serverId}\n`;
            msg += `   › Status: ${server.status}\n`;
            msg += `   › Days Remaining: ${remaining}\n\n`;
        });

        msg += `_Use /status to check your own servers._`;

        await ctx.reply(msg);
    }
};