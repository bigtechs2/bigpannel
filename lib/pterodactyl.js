const axios = require('axios');

class Pterodactyl {
    constructor(config) {
        this.config = config;
        this.baseURL = config.panelUrl;
        this.apiKey = config.apiKey;
        this.client = axios.create({
            baseURL: `${this.baseURL}/api/application`,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000
        });
    }

    async createServer({ name, email, username, password, ram, disk, cpu }) {
        try {
            // Step 1: Create user
            const userRes = await this.client.post('/users', {
                email: email || `${name}@bigst4ck.com`,
                username: username || name,
                first_name: name,
                last_name: 'User',
                password: password || 'P@ssw0rd123'
            });

            const userId = userRes.data.attributes.id;

            // Step 2: Get egg configuration
            const nestId = this.config.defaultNest || 5;
            const eggId = this.config.defaultEgg || 1;
            const eggRes = await this.client.get(`/nests/${nestId}/eggs/${eggId}`);
            const startup = eggRes.data.attributes.startup;

            // Step 3: Create server
            const limits = {
                memory: ram || this.config.defaultLimits.memory,
                swap: 0,
                disk: disk || this.config.defaultLimits.disk,
                io: 500,
                cpu: cpu || this.config.defaultLimits.cpu
            };

            const serverData = {
                name: name,
                user: userId,
                egg: eggId,
                docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
                startup: startup,
                environment: {
                    INST: 'npm',
                    USER_UPLOAD: '0',
                    AUTO_UPDATE: '0',
                    CMD_RUN: 'npm start',
                    JS_FILE: 'index.js',
                    MAIN_FILE: 'index.js'
                },
                limits: limits,
                feature_limits: {
                    databases: 0,
                    backups: 0,
                    allocations: 0
                },
                deploy: {
                    locations: [this.config.defaultLocation || 1],
                    dedicated_ip: false,
                    port_range: []
                }
            };

            const serverRes = await this.client.post('/servers', serverData);
            const serverId = serverRes.data.attributes.id;

            return {
                id: serverId,
                username: username || name,
                password: password || 'P@ssw0rd123',
                limits: limits,
                panelUrl: this.baseURL
            };

        } catch (error) {
            console.error('[Pterodactyl] Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.errors?.[0]?.detail || error.message);
        }
    }

    async getServer(serverId) {
        try {
            const res = await this.client.get(`/servers/${serverId}`);
            return res.data.attributes;
        } catch (error) {
            throw new Error(error.response?.data?.errors?.[0]?.detail || error.message);
        }
    }

    async deleteServer(serverId) {
        try {
            await this.client.delete(`/servers/${serverId}`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.errors?.[0]?.detail || error.message);
        }
    }

    async listServers(page = 1) {
        try {
            const res = await this.client.get(`/servers?page=${page}`);
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.errors?.[0]?.detail || error.message);
        }
    }

    async getUser(userId) {
        try {
            const res = await this.client.get(`/users/${userId}`);
            return res.data.attributes;
        } catch (error) {
            throw new Error(error.response?.data?.errors?.[0]?.detail || error.message);
        }
    }

    async deleteUser(userId) {
        try {
            await this.client.delete(`/users/${userId}`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.errors?.[0]?.detail || error.message);
        }
    }
}

module.exports = Pterodactyl;