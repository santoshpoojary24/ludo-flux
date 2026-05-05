const { getDb } = require('../config/db');

/**
 * Records a new activity event in the database and broadcasts it to friends in real-time.
 */
const recordActivity = async (io, userUid, eventType, payload) => {
    try {
        const db = await getDb();
        const payloadStr = JSON.stringify(payload);
        
        // Save to DB
        const insertResult = await db.run(
            `INSERT INTO activity_feed (user_uid, event_type, payload) VALUES (?, ?, ?)`,
            [userUid, eventType, payloadStr]
        );

        // Get user details for the broadcast
        const user = await db.get(`SELECT username FROM users WHERE uid = ?`, [userUid]);
        
        const eventData = {
            id: insertResult?.lastID,
            userUid,
            username: user?.username || 'Unknown',
            eventType,
            payload,
            created_at: new Date().toISOString()
        };

        // Find friends of this user to broadcast (users who have added this person as a friend)
        const friends = await db.all(`SELECT user_uid FROM friends WHERE friend_uid = ?`, [userUid]);
        
        friends.forEach(f => {
            io.to(`user:${f.user_uid}`).emit('feed:new_event', eventData);
        });

        // Also broadcast to the user themselves for their own feed
        io.to(`user:${userUid}`).emit('feed:new_event', eventData);

    } catch (err) {
        console.error('Failed to record activity:', err);
    }
};

module.exports = { recordActivity };
