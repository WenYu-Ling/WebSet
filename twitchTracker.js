class TwitchTracker {
    constructor() {
        if (typeof TWITCH_CONFIG === 'undefined') {
            console.error(" 錯誤: TWITCH_CONFIG 未定義，請確認是否已載入 config.js！");
            return;
        }

        this.statsManager = new StatsManager('twitch_stats');
        this.element = document.getElementById('twitch-followers');
        this.accessToken = null;
        this.tokenExpiry = null;
        this.userId = null; // 緩存 User ID
    }

    async getAccessToken() {
        try {
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            if (!TWITCH_CONFIG.CLIENT_ID || !TWITCH_CONFIG.CLIENT_SECRET) {
                throw new Error(' Twitch API 設定錯誤：請確認 CLIENT_ID 和 CLIENT_SECRET 是否正確設置！');
            }

            const response = await fetch(`https://id.twitch.tv/oauth2/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: TWITCH_CONFIG.CLIENT_ID,
                    client_secret: TWITCH_CONFIG.CLIENT_SECRET,
                    grant_type: 'client_credentials'
                })
            });

            if (!response.ok) {
                throw new Error(`Twitch Access Token 錯誤: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            console.error(' Twitch Auth Error:', error);
            return null;
        }
    }

    async fetchUserId() {
        if (this.userId) return this.userId;

        try {
            const token = await this.getAccessToken();
            if (!token) throw new Error(' 無法獲取 Access Token，請檢查 Twitch API 設定！');

            const response = await fetch(`https://api.twitch.tv/helix/users?login=${TWITCH_CONFIG.USERNAME}`, {
                headers: {
                    'Client-ID': TWITCH_CONFIG.CLIENT_ID,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Twitch User ID 請求錯誤: ${response.status} ${response.statusText}`);

            const data = await response.json();
            if (!data.data || data.data.length === 0) throw new Error(' 無法找到 Twitch 用戶！');

            this.userId = data.data[0].id;
            return this.userId;
        } catch (error) {
            console.error(' Twitch User ID Error:', error);
            return null;
        }
    }

    async fetchFollowers() {
        try {
            const token = await this.getAccessToken();
            const userId = await this.fetchUserId();
            if (!userId) throw new Error(' 無法獲取 User ID');

            const response = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userId}`, {
                headers: {
                    'Client-ID': TWITCH_CONFIG.CLIENT_ID,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Twitch API request failed: ${response.status} ${response.statusText}`);

            const data = await response.json();
            return data.total;
        } catch (error) {
            console.error(' Twitch API Error:', error);
            return this.statsManager.getStoredData()?.count || null;
        }
    }

    async update() {
        try {
            updateLoadingState('twitch-followers', true);

            // 若不需要更新，則使用快取數據
            if (!this.statsManager.shouldUpdate()) {
                const cachedData = this.statsManager.getStoredData();
                this.element.textContent = cachedData?.count
                    ? `${new Intl.NumberFormat().format(cachedData.count)} (快取)`
                    : "資料載入失敗";
                return;
            }

            const count = await this.fetchFollowers();
            if (count !== null) {
                this.statsManager.storeData(count, Date.now());
                this.element.textContent = new Intl.NumberFormat().format(count);
            } else {
                this.element.textContent = "資料載入失敗";
            }
        } catch (error) {
            console.error(' 更新 Twitch 追蹤者數量時發生錯誤:', error);
        } finally {
            updateLoadingState('twitch-followers', false);
        }
    }

    resetToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.userId = null;
    }
}
