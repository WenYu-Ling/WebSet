class StatsManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    getStoredData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
    }

    storeData(count, timestamp) {
        const data = {
            count: Number(count),
            lastUpdate: timestamp,
            history: this.getStoredData()?.history || []
        };

        if (!isNaN(count)) {
            data.history.push({ count: Number(count), timestamp });
            if (data.history.length > 60) {
                data.history.shift();
            }
        }

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data;
    }

    shouldUpdate() {
        const data = this.getStoredData();
        if (!data) return true;

        const now = new Date().getTime();
        return (now - data.lastUpdate) >= YOUTUBE_CONFIG.UPDATE_INTERVAL;
    }
}

// 工具函數
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