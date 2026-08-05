const moment = require('moment-timezone');
const axios = require('axios');

function randomKarakter(jumlah) {
    const huruf = "abcdefghijklmnopqrstuvwxyz";
    let hasil = "";
    for (let i = 0; i < jumlah; i++) {
        let h = huruf[Math.floor(Math.random() * huruf.length)];
        hasil += Math.random() < 0.5 ? h.toUpperCase() : h;
    }
    return hasil;
}

async function createPanel(ctx, { memo, cpu, disk }) {
    const text = ctx.text || "";
    const t = text.split("-");

    if (t.length < 2) {
        return await ctx.reply(`Example: /create username-number`);
    }

    const username = t[0];
    const targetJid = t[1] ? t[1].replace(/[^0-9]/g, "") : "telegram-user";

    const email = `${username}@gmail.com`;
    const deskripsi = moment().tz("Africa/Nairobi").format("dddd, D MMMM - YYYY");
    const password = "@datManj@9";

    // ── Get panel URL and API key from environment ──
    const panelUrl = process.env.PANEL_URL || global.domain;
    const apiKey = process.env.API_KEY || global.plta;
    const nestId = process.env.NEST_ID || global.nest || 5;
    const eggId = process.env.EGG_ID || global.eggs || 1;
    const locationId = process.env.LOCATION_ID || global.locc || 1;

    if (!panelUrl || !apiKey) {
        return await ctx.reply('❌ Panel URL or API Key not configured. Please check your .env file.');
    }

    // ── Create User ──
    let user;
    try {
        const resUser = await axios.post(`${panelUrl}/api/application/users`, {
            email,
            username,
            first_name: username,
            last_name: username,
            language: "en",
            password: String(password)
        }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            timeout: 10000
        });

        const data = resUser.data;
        if (data.errors) {
            const errMsg = data.errors.map(e => e.detail || JSON.stringify(e)).join("\n");
            return await ctx.reply(`❌ *User Creation Failed*\n\`\`\`\n${errMsg}\n\`\`\``);
        }
        user = data.attributes;
    } catch (error) {
        console.error("[createPanel] User creation error:", error.response?.data || error.message);
        const status = error.response?.status || "N/A";
        const detail = error.response?.data?.errors?.[0]?.detail || error.message || "Unknown error";
        return await ctx.reply(
            `❌ *User Creation Error*\n` +
            `Status: ${status}\n` +
            `Detail: ${detail}`
        );
    }

    // ── Fetch egg configuration ──
    let eggData;
    try {
        const eggRes = await axios.get(`${panelUrl}/api/application/nests/${nestId}/eggs/${eggId}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            timeout: 10000
        });
        eggData = eggRes.data.attributes;
    } catch (error) {
        console.error("[createPanel] Egg fetch error:", error.response?.data || error.message);
        const status = error.response?.status || "N/A";
        const detail = error.response?.data?.errors?.[0]?.detail || error.message || "Unknown error";
        return await ctx.reply(
            `❌ *Egg Fetch Error*\n` +
            `Status: ${status}\n` +
            `Detail: ${detail}`
        );
    }

    const startupCmd = eggData.startup;

    // ── Create Server ──
    let server;
    try {
        const resServer = await axios.post(`${panelUrl}/api/application/servers`, {
            name: username,
            description: deskripsi,
            user: user.id,
            egg: parseInt(eggId),
            docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
            startup: startupCmd,
            environment: {
                INST: "npm",
                USER_UPLOAD: "0",
                AUTO_UPDATE: "0",
                CMD_RUN: "npm start",
                JS_FILE: "index.js",
                MAIN_FILE: "index.js"
            },
            limits: {
                memory: parseInt(memo) || 1024,
                swap: 0,
                disk: parseInt(disk) || 5120,
                io: 500,
                cpu: parseInt(cpu) || 100
            },
            feature_limits: {
                databases: 0,
                backups: 0,
                allocations: 0
            },
            deploy: {
                locations: [parseInt(locationId)],
                dedicated_ip: false,
                port_range: []
            }
        }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            timeout: 15000
        });

        const res = resServer.data;
        if (res.errors) {
            const errMsg = res.errors.map(e => e.detail || JSON.stringify(e)).join("\n");
            return await ctx.reply(`❌ *Server Creation Failed*\n\`\`\`\n${errMsg}\n\`\`\``);
        }
        server = res.attributes;
    } catch (error) {
        console.error("[createPanel] Server creation error:", error.response?.data || error.message);
        const status = error.response?.status || "N/A";
        const detail = error.response?.data?.errors?.[0]?.detail || error.message || "Unknown error";
        return await ctx.reply(
            `❌ *Server Creation Error*\n` +
            `Status: ${status}\n` +
            `Detail: ${detail}`
        );
    }

    // ── Send confirmation ──
    await ctx.reply(
        `✅ *Server Created Successfully!*\n\n` +
        `🆔 User ID: ${user.id}\n` +
        `🆔 Server ID: ${server.id}\n` +
        `💾 RAM: ${memo} MB\n` +
        `💿 Disk: ${disk} MB\n` +
        `⚙️ CPU: ${cpu}%\n\n` +
        `_Credentials have been sent._`
    );

    return { serverId: server.id, username: user.username, password };
}

module.exports = createPanel;