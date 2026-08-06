require('dotenv').config();
const { Telegraf, session, Markup } = require('telegraf');
const fs = require('node:fs');
const path = require('node:path');

// ── Load config ──
let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch {
    console.error('❌ config.json not found! Copy config.example.json to config.json');
    process.exit(1);
}

// ── Database ──
const { Database } = require('./lib/database');
const db = new Database();

// ── Pterodactyl ──
const Pterodactyl = require('./lib/pterodactyl');
const ptero = new Pterodactyl(config.pterodactyl);

// ── Payments ──
const Payments = require('./lib/payments');
const payments = new Payments(config.payments);

// ── Create Panel ──
const createPanel = require('./lib/createPanel');

// ── Initialize bot ──
const bot = new Telegraf(config.telegram.botToken);

// ── Session middleware ──
bot.use(session());

// ── Ensure session exists for all updates ──
bot.use(async (ctx, next) => {
    if (!ctx.session) {
        ctx.session = {};
    }
    await next();
});

// ── Middleware: Check if user is banned ──
bot.use(async (ctx, next) => {
    if (ctx.from) {
        const userData = db.getUser(ctx.from.id);
        if (userData.banned) {
            return await ctx.reply('⛔ You have been banned from using this bot.');
        }
    }
    await next();
});

// ── Load all commands ──
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

// ── Register standard commands ──
commandFiles.forEach(file => {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name && !cmd.dynamic) {
        bot.command(cmd.name, async (ctx) => {
            try {
                await cmd.execute(ctx, { bot, db, ptero, payments, config, createPanel });
            } catch (error) {
                console.error(`[${cmd.name}] Error:`, error);
                await ctx.reply('❌ An error occurred. Please try again later.');
            }
        });
        console.log(`✅ Loaded command: /${cmd.name}`);
    }
});

// ── Dynamic plan commands (/1gb to /10gb, /unli) ──
const planAliases = ['1gb', '2gb', '3gb', '4gb', '5gb', '6gb', '7gb', '8gb', '9gb', '10gb', 'unli'];
planAliases.forEach(alias => {
    bot.command(alias, async (ctx) => {
        try {
            const planMap = {
                '1gb': 0, '2gb': 1, '3gb': 2, '4gb': 3,
                '5gb': 4, '6gb': 5, '7gb': 6, '8gb': 7,
                '9gb': 8, '10gb': 9, 'unli': 10, 'unlimited': 10
            };
            const planIndex = planMap[alias];
            if (planIndex === undefined) {
                return await ctx.reply('❌ Unknown plan.');
            }

            const plan = config.plans[planIndex];
            const user = ctx.from;
            const isOwner = user.id.toString() === config.telegram.ownerId.toString();
            const userDb = db.getUser(user.id);

            if (userDb.banned) {
                return await ctx.reply('⛔ You have been banned from using this bot.');
            }

            if (plan.name === 'Unlimited' && !isOwner && !userDb.premium) {
                return await ctx.reply('⛔ Only premium users or the owner can create unlimited servers.');
            }

            await ctx.reply(`⏳ Creating ${plan.name} server...`);

            const username = `user_${user.id}_${Date.now().toString().slice(-6)}`;
            const password = `@datManj@9`;

            const result = await createPanel({
                text: `${username}-${user.id}`,
                reply: async (msg) => { await ctx.reply(msg); },
                sender: { isOwner: () => isOwner }
            }, {
                memo: plan.ram.toString(),
                cpu: plan.cpu.toString(),
                disk: plan.disk.toString()
            });

            userDb.servers = userDb.servers || [];
            userDb.servers.push({
                serverId: result?.serverId || 'created',
                plan: plan.name,
                createdAt: Date.now(),
                expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
                status: 'active'
            });
            db.saveUser(user.id, userDb);

            await ctx.reply(
                `✅ *${plan.name} Server Created!*\n\n` +
                `🖥️ *Plan:* ${plan.name}\n` +
                `💾 *RAM:* ${plan.ram === 0 ? '∞' : plan.ram + ' MB'}\n` +
                `💿 *Disk:* ${plan.disk === 0 ? '∞' : plan.disk + ' MB'}\n` +
                `⚙️ *CPU:* ${plan.cpu === 0 ? '∞' : plan.cpu + '%'}\n\n` +
                `*Login Details:*\n` +
                `🔗 ${config.pterodactyl.panelUrl}\n` +
                `👤 Username: ${username}\n` +
                `🔑 Password: ${password}\n\n` +
                `_Thank you for choosing BIGST4CK!_`
            );

            if (!isOwner) {
                await bot.telegram.sendMessage(
                    config.telegram.ownerId,
                    `📢 *${plan.name} Server Created*\n` +
                    `User: @${user.username || 'Unknown'} (ID: ${user.id})`
                );
            }

        } catch (error) {
            console.error(`[${alias}] Error:`, error);
            await ctx.reply(`❌ Failed to create server: ${error.message}`);
        }
    });
    console.log(`✅ Loaded command: /${alias}`);
});

// ── Handle callback queries ──
bot.action(/buy_plan_(\d+)/, async (ctx) => {
    // Ensure session exists
    if (!ctx.session) {
        ctx.session = {};
    }

    const planIndex = parseInt(ctx.match[1]);
    const plan = config.plans[planIndex];

    if (!plan) {
        return await ctx.answerCbQuery('❌ Plan not found.');
    }

    ctx.session.buyPlan = planIndex;
    await ctx.answerCbQuery('✅ Plan selected!');
    await ctx.reply(
        `📋 *Plan Selected: ${plan.name}*\n\n` +
        `💾 RAM: ${plan.ram === 0 ? '∞' : plan.ram + ' MB'}\n` +
        `💿 Disk: ${plan.disk === 0 ? '∞' : plan.disk + ' MB'}\n` +
        `⚙️ CPU: ${plan.cpu === 0 ? '∞' : plan.cpu + '%'}\n` +
        `💰 Price: ${plan.price.toLocaleString()} ${plan.currency}\n\n` +
        `How would you like to pay?`,
        Markup.inlineKeyboard([
            [Markup.button.callback('💳 Crypto Pay', 'pay_crypto')],
            [Markup.button.callback('📱 Manual Payment', 'pay_manual')],
            [Markup.button.callback('🔙 Back', 'back_plans')]
        ])
    );
});

bot.action('pay_crypto', async (ctx) => {
    await ctx.answerCbQuery('💳 Crypto payment coming soon!');
    await ctx.reply(
        `💳 *Crypto Payment*\n\n` +
        `Pay with USDT (TRC20) or BTC.\n\n` +
        `• USDT (TRC20): TXXX...\n` +
        `• BTC: 1XXX...\n\n` +
        `Send payment confirmation to proceed.`
    );
});

bot.action('pay_manual', async (ctx) => {
    // Ensure session exists
    if (!ctx.session) {
        ctx.session = {};
    }

    const planIndex = ctx.session.buyPlan;
    const plan = config.plans[planIndex];

    if (planIndex === undefined || !plan) {
        await ctx.answerCbQuery('❌ Please select a plan first.');
        return;
    }

    await ctx.answerCbQuery('📱 Manual payment selected');

    const paymentMsg =
        `📱 *Manual Payment*\n\n` +
        `*Plan:* ${plan.name}\n` +
        `*Amount:* ${plan.price.toLocaleString()} ${plan.currency}\n\n` +
        `*Send payment to:*\n` +
        `${config.payments.details}\n\n` +
        `*After payment:*\n` +
        `1. Send payment screenshot\n` +
        `2. Type /confirm_payment\n\n` +
        `_Payment will be verified within 5 minutes._`;

    await ctx.reply(paymentMsg);
});

bot.action('back_plans', async (ctx) => {
    await ctx.answerCbQuery('🔙 Back to plans');
    const { getPlansMessage } = require('./commands/plans');
    await getPlansMessage(ctx, config);
});

// ── /confirm_payment ──
bot.command('confirm_payment', async (ctx) => {
    const user = ctx.from;
    const planIndex = ctx.session?.buyPlan;

    if (planIndex === undefined) {
        return await ctx.reply('❌ Please select a plan first. Use /plans');
    }

    const plan = config.plans[planIndex];
    const userDb = db.getUser(user.id);

    if (userDb.pendingOrder) {
        return await ctx.reply('⚠️ You already have a pending order. Please wait for verification.');
    }

    // ── Save pending order ──
    userDb.pendingOrder = {
        plan: planIndex,
        planName: plan.name,
        price: plan.price,
        timestamp: Date.now(),
        status: 'pending'
    };
    db.saveUser(user.id, userDb);

    // ── Verify it was saved ──
    const verifyUser = db.getUser(user.id);
    console.log(`[confirm_payment] Saved pending order for ${user.id}:`, verifyUser.pendingOrder);

    const ownerId = config.telegram.ownerId;
    await bot.telegram.sendMessage(
        ownerId,
        `📢 *New Payment Pending*\n\n` +
        `User: @${user.username || 'Unknown'} (ID: ${user.id})\n` +
        `Plan: ${plan.name}\n` +
        `Amount: ${plan.price.toLocaleString()} ${plan.currency}\n` +
        `Status: Pending verification\n\n` +
        `Use /verify ${user.id} to create the server.`
    );

    await ctx.reply(
        `✅ *Payment confirmation received!*\n\n` +
        `Plan: ${plan.name}\n` +
        `Amount: ${plan.price.toLocaleString()} ${plan.currency}\n\n` +
        `⏳ Waiting for admin verification...\n` +
        `You will receive your server credentials shortly.`
    );
});

// ── /verify (admin) ──
bot.command('verify', async (ctx) => {
    if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
        return await ctx.reply('⛔ Only the bot owner can verify payments.');
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return await ctx.reply(
            `*Usage:* /verify <user_id>\n` +
            `Example: /verify 123456789`
        );
    }

    const userId = parseInt(args[1]);
    if (isNaN(userId)) {
        return await ctx.reply('❌ Invalid user ID. Please provide a valid number.');
    }

    // ── Debug: List all users ──
    console.log(`[verify] Checking pending order for user ${userId}`);
    const allUsers = db.getAllUsers();
    console.log('[verify] All users in DB:', Object.keys(allUsers));

    const userDb = db.getUser(userId);
    console.log(`[verify] User ${userId} data:`, userDb);

    if (!userDb || !userDb.pendingOrder) {
        return await ctx.reply(`❌ No pending order found for user ${userId}.`);
    }

    const order = userDb.pendingOrder;
    const plan = config.plans[order.plan];

    try {
        const result = await createPanel({
            text: `telegram-${userId}-${Date.now()}`,
            reply: async (msg) => { await ctx.reply(msg); },
            sender: { isOwner: () => true }
        }, {
            memo: plan.ram.toString(),
            cpu: plan.cpu.toString(),
            disk: plan.disk.toString()
        });

        userDb.servers = userDb.servers || [];
        userDb.servers.push({
            serverId: result?.serverId || 'created',
            plan: plan.name,
            createdAt: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
            status: 'active'
        });

        delete userDb.pendingOrder;
        db.saveUser(userId, userDb);

        await bot.telegram.sendMessage(
            userId,
            `✅ *Server Created Successfully!*\n\n` +
            `🖥️ *Plan:* ${plan.name}\n` +
            `📅 *Valid Until:* ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}\n\n` +
            `*Panel Details:*\n` +
            `🔗 ${config.pterodactyl.panelUrl}\n` +
            `👤 Username: ${result?.username || 'check_panel'}\n` +
            `🔑 Password: ${result?.password || 'check_panel'}\n\n` +
            `_Thank you for choosing BIGST4CK!_`
        );

        await ctx.reply(
            `✅ *Server created successfully!*\n\n` +
            `User: ${userId}\n` +
            `Plan: ${plan.name}\n\n` +
            `Credentials have been sent to the user.`
        );

    } catch (error) {
        console.error('[verify] Error:', error);
        await ctx.reply(`❌ Failed to create server: ${error.message}`);
    }
});

// ── /pending (admin) ──
bot.command('pending', async (ctx) => {
    if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
        return await ctx.reply('⛔ Only the bot owner can view pending orders.');
    }

    const allUsers = db.getAllUsers();
    const pending = [];

    for (const [userId, userData] of Object.entries(allUsers)) {
        if (userData.pendingOrder) {
            pending.push({
                userId,
                ...userData.pendingOrder
            });
        }
    }

    if (pending.length === 0) {
        return await ctx.reply('📭 No pending orders.');
    }

    let msg = `📋 *Pending Orders (${pending.length})*\n\n`;
    pending.forEach((order, i) => {
        msg += `${i+1}. User: ${order.userId}\n`;
        msg += `   Plan: ${order.planName}\n`;
        msg += `   Amount: ${order.price.toLocaleString()}\n`;
        msg += `   /verify ${order.userId}\n\n`;
    });

    await ctx.reply(msg);
});

// ── /debug (admin) ── Show all users
bot.command('debug', async (ctx) => {
    if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
        return await ctx.reply('⛔ Only the bot owner can use this command.');
    }

    const allUsers = db.getAllUsers();
    let msg = `📊 *Database Users (${Object.keys(allUsers).length})*\n\n`;
    for (const [userId, data] of Object.entries(allUsers)) {
        const hasPending = data.pendingOrder ? '✅' : '❌';
        const serverCount = data.servers ? data.servers.length : 0;
        msg += `ID: ${userId} | Pending: ${hasPending} | Servers: ${serverCount}\n`;
        if (data.pendingOrder) {
            msg += `   Plan: ${data.pendingOrder.planName} | ${data.pendingOrder.price.toLocaleString()}\n`;
        }
    }
    await ctx.reply(msg || 'No users found.');
});

// ── /ban (admin) ──
bot.command('ban', async (ctx) => {
    if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
        return await ctx.reply('⛔ Only the bot owner can ban users.');
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return await ctx.reply('*Usage:* /ban <user_id>');
    }

    const userId = parseInt(args[1]);
    const userDb = db.getUser(userId);
    if (userDb) {
        userDb.banned = true;
        db.saveUser(userId, userDb);
        await ctx.reply(`✅ User ${userId} has been banned.`);
    } else {
        await ctx.reply('❌ User not found.');
    }
});

// ── /unban (admin) ──
bot.command('unban', async (ctx) => {
    if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
        return await ctx.reply('⛔ Only the bot owner can unban users.');
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return await ctx.reply('*Usage:* /unban <user_id>');
    }

    const userId = parseInt(args[1]);
    const userDb = db.getUser(userId);
    if (userDb) {
        userDb.banned = false;
        db.saveUser(userId, userDb);
        await ctx.reply(`✅ User ${userId} has been unbanned.`);
    } else {
        await ctx.reply('❌ User not found.');
    }
});

// ── /restart (admin) ──
bot.command('restart', async (ctx) => {
    if (ctx.from.id.toString() !== config.telegram.ownerId.toString()) {
        return await ctx.reply('⛔ Only the bot owner can restart the bot.');
    }
    await ctx.reply('🔄 Restarting bot...');
    process.exit(0);
});

// ── Start bot ──
bot.launch().then(() => {
    console.log('🤖 BIGST4CK Telegram Bot is running!');
    console.log(`📱 Bot username: @${bot.botInfo.username}`);
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

// ── Graceful shutdown ──
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));