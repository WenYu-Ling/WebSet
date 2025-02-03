class YouTubeTracker {
    constructor() {
        if (typeof YOUTUBE_CONFIG === 'undefined') {
            console.error("YOUTUBE_CONFIG 未定義，請確認是否已載入 config.js！");
            return;
        }

        this.statsManager = new StatsManager('youtube_stats');
        this.element = document.getElementById('youtube-subscribers');
        this.statsManager = new StatsManager('youtube');
    }

    async fetchSubscribers() {
        if (!YOUTUBE_CONFIG.API_KEY || !YOUTUBE_CONFIG.CHANNEL_ID) {
            console.error("YouTube API 設定錯誤！");
            return null;
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CONFIG.CHANNEL_ID}&key=${YOUTUBE_CONFIG.API_KEY}`
            );

            if (!response.ok) throw new Error(`HTTP Error: ${response.statusText}`);

            const data = await response.json();
            return data.items[0].statistics.subscriberCount;
        } catch (error) {
            console.error("YouTube API 錯誤:", error);
            return null;
        }
    }

    async update() {
        if (!this.element) {
            console.error("找不到顯示元素 #youtube-subscribers");
            return;
        }

        try {
            updateLoadingState("youtube-subscribers", true);
            const count = await this.fetchSubscribers();

            this.element.textContent = count
                ? new Intl.NumberFormat().format(count)
                : "資料載入失敗";
        } catch (error) {
            console.error("更新訂閱者數量時發生錯誤:", error);
        } finally {
            updateLoadingState("youtube-subscribers", false);
        }
    }
}
