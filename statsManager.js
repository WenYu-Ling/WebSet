// statsManager.js
class StatsManager {
    constructor(platform) {
        this.platform = platform;
        this.storageKey = `${platform}_stats`;
    }

    getStoredData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error getting stored data:', error);
            return null;
        }
    }

    storeData(count, timestamp) {
        try {
            if (isNaN(count)) return null;

            const data = {
                count: Number(count),
                lastUpdate: timestamp,
                history: this.getStoredData()?.history || []
            };

            // 添加新數據到歷史記錄
            data.history.push({ count: Number(count), timestamp });
            
            // 保持最多60筆歷史記錄
            if (data.history.length > 60) {
                data.history.shift();
            }

            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error storing data:', error);
            return null;
        }
    }

    shouldUpdate() {
        const data = this.getStoredData();
        if (!data) return true;

        const updateInterval = this.platform === 'youtube' 
            ? YOUTUBE_CONFIG.UPDATE_INTERVAL 
            : TWITCH_CONFIG.UPDATE_INTERVAL;

        const now = Date.now();
        return (now - data.lastUpdate) >= updateInterval;
    }
}

// 添加 debounce 函數的定義
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}