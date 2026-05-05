const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ludoflux_super_secret';

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const token = header.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get activity feed for the current user (from friends and themselves)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const myUid = req.user.uid;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 20);
        const db = await getDb();
        
        // Fetch events from users that are friends of the current user
        // OR the user's own events
        const feed = await db.all(`
            SELECT a.*, u.username
            FROM activity_feed a
            JOIN users u ON a.user_uid = u.uid
            WHERE a.user_uid = ? 
               OR a.user_uid IN (SELECT friend_uid FROM friends WHERE user_uid = ?)
            ORDER BY a.created_at DESC
            LIMIT ?
        `, [myUid, myUid, limit]);

        // Parse payloads
        const parsedFeed = feed.map(item => {
            let payload = {};
            try {
                payload = JSON.parse(item.payload);
            } catch (error) {
                payload = {};
            }

            return {
                ...item,
                payload
            };
        });

        res.json(parsedFeed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load activity feed' });
    }
});

module.exports = router;
