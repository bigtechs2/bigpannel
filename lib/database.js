const fs = require('node:fs');
const path = require('node:path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/telegram_users.json');
        
        // ── Create database directory if it doesn't exist ──
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // ── Create database file if it doesn't exist ──
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
        }
    }

    // ── Get all users ──
    getAllUsers() {
        try {
            const data = fs.readFileSync(this.dbPath, 'utf8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    // ── Get a single user ──
    getUser(userId) {
        const users = this.getAllUsers();
        const key = String(userId);
        if (!users[key]) {
            return {
                userId: userId,
                servers: [],
                pendingOrder: null,
                banned: false,
                premium: false,
                purchased: [],
                createdAt: Date.now()
            };
        }
        return users[key];
    }

    // ── Save a user ──
    saveUser(userId, data) {
        const users = this.getAllUsers();
        users[String(userId)] = data;
        fs.writeFileSync(this.dbPath, JSON.stringify(users, null, 2));
    }
}

module.exports = { Database };