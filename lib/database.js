const simpl = require('simpl.db');
const path = require('node:path');
const fs = require('node:fs');

class Database {
    constructor() {
        const dbPath = path.join(__dirname, '../database');
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }

        this.db = new simpl.Database({
            collectionsFolder: dbPath
        });

        this.collection = this.db.getCollection('telegram_users');
        if (!this.collection) {
            this.collection = this.db.createCollection('telegram_users', {});
        }
        console.log('[Database] Initialized, collection exists:', !!this.collection);
    }

    getUser(userId) {
        try {
            const key = String(userId);
            const data = this.collection.get(key);
            if (!data) {
                return {
                    userId: key,
                    servers: [],
                    pendingOrder: null,
                    banned: false,
                    premium: false,
                    purchased: [],
                    createdAt: Date.now()
                };
            }
            return data;
        } catch (error) {
            console.error('[Database] getUser error:', error);
            return {
                userId: String(userId),
                servers: [],
                pendingOrder: null,
                banned: false,
                premium: false,
                purchased: [],
                createdAt: Date.now()
            };
        }
    }

    saveUser(userId, data) {
        try {
            const key = String(userId);
            this.collection.set(key, data);
            console.log(`[Database] Saved user ${key}: pendingOrder=${data.pendingOrder ? 'YES' : 'NO'}`);
            return true;
        } catch (error) {
            console.error('[Database] saveUser error:', error);
            return false;
        }
    }

    getAllUsers() {
        try {
            const all = this.collection.getAll();
            const result = {};
            for (const [key, value] of Object.entries(all)) {
                result[key] = value;
            }
            return result;
        } catch (error) {
            console.error('[Database] getAllUsers error:', error);
            return {};
        }
    }
}

module.exports = { Database };