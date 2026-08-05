module.exports = {
    name: "deluser",
    execute: async (ctx, { config, db, ptero }) => {
        const isOwner = ctx.from.id.toString() === config.telegram.ownerId.toString();

        if (!isOwner) {
            return await ctx.reply('⛔ Only the bot owner can delete users.');
        }

        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return await ctx.reply(
                `*Usage:* /deluser <user_id>\n` +
                `Example: /deluser 123456789`
            );
        }

        const userId = parseInt(args[1]);
        const userDb = db.getUser(userId);

        if (!userDb) {
            return await ctx.reply(`❌ User ${userId} not found.`);
        }

        // Delete all servers associated with this user
        if (userDb.servers) {
            for (const server of userDb.servers) {
                try {
                    await ptero.deleteServer(server.serverId);
                } catch (_) {}
            }
        }

        // Remove user from database
        const allUsers = db.getAllUsers();
        delete allUsers[userId];
        // Clear and re-save all users
        db.collection.clear();
        for (const [key, value] of Object.entries(allUsers)) {
            db.saveUser(parseInt(key), value);
        }

        await ctx.reply(`✅ *User ${userId} and all their servers deleted successfully!*`);
    }
};