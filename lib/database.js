const fs = require('node:fs');
const path = require('node:path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/telegram_users.json');
        this.ensureDatabase();
    }

    // ─── Ensure database file exists ───
    ensureDatabase() {
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log(`📁 Created database directory: ${dbDir}`);
        }
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, JSON.stringify({}, null, 2));
            console.log(`📄 Created database file: ${this.dbPath}`);
        }
    }

    // ─── Get all users ───
    getAllUsers() {
        try {
            const data = fs.readFileSync(this.dbPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('[Database] Failed to read all users:', error);
            return {};
        }
    }

    // ─── Get a single user ───
    getUser(userId) {
        const users = this.getAllUsers();
        const key = String(userId); // Ensure it's a string
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

    // ─── Save a user ───
    saveUser(userId, data) {
        try {
            const users = this.getAllUsers();
            const key = String(userId);
            users[key] = data;
            fs.writeFileSync(this.dbPath, JSON.stringify(users, null, 2));
            console.log(`💾 Saved user ${userId} (pendingOrder: ${data.pendingOrder ? 'yes' : 'no'})`);
            return true;
        } catch (error) {
            console.error('[Database] Failed to save user:', error);
            return false;
        }
    }

    // ─── Delete a user ───
    deleteUser(userId) {
        try {
            const users = this.getAllUsers();
            const key = String(userId);
            delete users[key];
            fs.writeFileSync(this.dbPath, JSON.stringify(users, null, 2));
            console.log(`🗑️ Deleted user ${userId}`);
            return true;
        } catch (error) {
            console.error('[Database] Failed to delete user:', error);
            return false;
        }
    }
}

module.exports = { Database };