module.exports = {
    name: "contact",
    execute: async (ctx, { config }) => {
        const contact =
            `📞 *Contact Us*\n\n` +
            `» *Telegram:* t.me/bigmanj09\n` +
            `» *WhatsApp:* wa.me/255636756591\n` +
            `» *Email:* bigmanj.tech@gmail.com\n\n` +
            `Our support team is available 24/7.`;
        await ctx.reply(contact);
    }
};