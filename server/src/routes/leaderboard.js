const express = require('express');
const { getDb } = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
        const db = await getDb();

        // Postgres-compatible leaderboard query.
        // We rely on players_json LIKE to find matches involving each user,
        // then compute wins as matches where winner_uid matches the user.
        const players = await db.all(
            `SELECT
               u.uid,
               u.username,
               u.elo,
               (SELECT COUNT(*) FROM match_history
                WHERE winner_uid = u.uid) AS wins,
               (SELECT COUNT(*) FROM match_history
                WHERE players_json LIKE '%' || u.uid || '%') AS total_matches
             FROM users u
             WHERE u.deactivated_at IS NULL
             ORDER BY u.elo DESC, wins DESC
             LIMIT ?`,
            [limit]
        );

        const enriched = players.map(p => ({
            ...p,
            wins: Number(p.wins),
            total_matches: Number(p.total_matches),
            winRate: Number(p.total_matches) ? Math.round((Number(p.wins) / Number(p.total_matches)) * 100) : 0
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;