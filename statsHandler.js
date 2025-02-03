// statsHandler.js

const fs = require('fs').promises;
const path = require('path');

class StatsHandler {
    constructor() {
        this.filePath = path.join(__dirname, 'subscribers.txt');
    }

    async readStats() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 如果檔案不存在，建立一個空的資料結構
                const initialData = {
                    youtube: { count: 0, lastUpdate: 0, history: [] },
                    twitch: { count: 0, lastUpdate: 0, history: [] }
                };
                await this.writeStats(initialData);
                return initialData;
            }
            throw error;
        }
    }

    async writeStats(data) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error writing stats:', error);
            return false;
        }
    }

    async updateStats(platform, count) {
        try {
            const stats = await this.readStats();
            const timestamp = Date.now();

            stats[platform] = {
                count: Number(count),
                lastUpdate: timestamp,
                history: [
                    ...(stats[platform]?.history || []).slice(-59),
                    { count: Number(count), timestamp }
                ]
            };

            await this.writeStats(stats);
            return stats[platform];
        } catch (error) {
            console.error(`Error updating ${platform} stats:`, error);
            return null;
        }
    }

    async getStats(platform) {
        try {
            const stats = await this.readStats();
            return stats[platform] || null;
        } catch (error) {
            console.error(`Error getting ${platform} stats:`, error);
            return null;
        }
    }

    shouldUpdate(lastUpdate, updateInterval) {
        const now = Date.now();
        return !lastUpdate || (now - lastUpdate) >= updateInterval;
    }
}

module.exports = new StatsHandler();