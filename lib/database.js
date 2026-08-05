const simpl = require('simpl.db');
const path = require('node:path');

class Database {
    constructor() {
        this.db = new simpl.Database({
            collectionsFolder: path.join(__dirname, '../database')
        });
        this.collection = this.db.getCollection('telegram_users');
        if (!this.collection) {
            this.collection = this.db.createCollection('telegram_users', {});
        }
    }

    getUser(userId) {
        const data = this.collection.get(`${userId}`);
        if (!data) {
            return {
                userId,
                servers: [],
                pendingOrder: null,
                banned: false,
                premium: false,
                purchased: [],
                createdAt: Date.now()
            };
        }
        return data;
    }

    saveUser(userId, data) {
        this.collection.set(`${userId}`, data);
    }

    getAllUsers() {
        const all = this.collection.getAll();
        const result = {};
        for (const [key, value] of Object.entries(all)) {
            result[key] = value;
        }
        return result;
    }
}

module.exports = { Database };