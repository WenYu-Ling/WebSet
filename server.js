// server.js

const express = require('express');
const statsHandler = require('./statsHandler');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 取得統計資料
app.get('/api/stats/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        if (!['youtube', 'twitch'].includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        const stats = await statsHandler.getStats(platform);
        if (!stats) {
            return res.status(404).json({ error: 'Stats not found' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 更新統計資料
app.post('/api/stats/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        const { count } = req.body;

        if (!['youtube', 'twitch'].includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        const stats = await statsHandler.updateStats(platform, count);
        if (!stats) {
            return res.status(500).json({ error: 'Failed to update stats' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});