const express = require('express');
const { getDb } = require('../config/db');
const redis = require('../config/redis');
const { authMiddleware } = require('../utils/auth');
const { normalizeUserRecord } = require('../utils/profile');

const router = express.Router();

const PRIVATE_ROOM_PREFIXES = ['PRIV-', 'CHALL-'];

const getPresenceDetails = (status, canSeeStatus) => {
  if (!canSeeStatus || !status) {
    return {
      status: 'offline',
      roomCode: null,
      canJoin: false,
      isPrivateRoom: false
    };
  }

  if (status.startsWith('ingame')) {
    const roomCode = status.split(':')[1] || null;
    const isPrivateRoom = PRIVATE_ROOM_PREFIXES.some((prefix) => roomCode?.startsWith(prefix));

    return {
      status: 'ingame',
      roomCode: isPrivateRoom ? null : roomCode,
      canJoin: Boolean(roomCode) && !isPrivateRoom,
      isPrivateRoom
    };
  }

  if (status === 'online') {
    return {
      status: 'online',
      roomCode: null,
      canJoin: false,
      isPrivateRoom: false
    };
  }

  return {
    status: 'offline',
    roomCode: null,
    canJoin: false,
    isPrivateRoom: false
  };
};

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { friendUid } = req.body;
    const myUid = req.user.uid;

    if (!friendUid || typeof friendUid !== 'string') {
      return res.status(400).json({ error: 'Friend UID is required' });
    }
    if (friendUid === myUid) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    const db = await getDb();
    const isBlocked = await db.get(
      `SELECT 1
       FROM blocked_users
       WHERE (blocker_uid = ? AND blocked_uid = ?)
          OR (blocker_uid = ? AND blocked_uid = ?)
       LIMIT 1`,
      [myUid, friendUid, friendUid, myUid]
    );
    if (isBlocked) {
      return res.status(403).json({ error: 'This player is unavailable' });
    }

    const friendRow = await db.get('SELECT * FROM users WHERE uid = ?', [friendUid]);
    const friend = normalizeUserRecord(friendRow);
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (friend.privacy_settings.allowFriendRequests === 'nobody') {
      return res.status(403).json({ error: 'This player is not accepting friend requests' });
    }

    await db.run(
      `INSERT INTO friends (user_uid, friend_uid) VALUES (?, ?) ON CONFLICT DO NOTHING`,
      [myUid, friendUid]
    );
    await db.run(
      `INSERT INTO friends (user_uid, friend_uid) VALUES (?, ?) ON CONFLICT DO NOTHING`,
      [friendUid, myUid]
    );

    res.json({
      message: 'Friend added successfully',
      friend: {
        uid: friend.uid,
        username: friend.username
      }
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Already friends' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const myUid = req.user.uid;
    const db = await getDb();

    const friends = await db.all(
      `SELECT u.*, f.created_at
       FROM friends f
       JOIN users u ON u.uid = f.friend_uid
       WHERE f.user_uid = ?
         AND NOT EXISTS (
           SELECT 1
           FROM blocked_users b
           WHERE (b.blocker_uid = ? AND b.blocked_uid = u.uid)
              OR (b.blocker_uid = u.uid AND b.blocked_uid = ?)
         )
       ORDER BY f.created_at DESC`,
      [myUid, myUid, myUid]
    );

    const result = [];
    for (const friendRow of friends) {
      const friend = normalizeUserRecord(friendRow);
      const rawStatus = await redis.get(`presence:${friend.uid}`);
      const canSeeStatus =
        friend.privacy_settings.showOnlineStatus === 'everyone' ||
        friend.privacy_settings.showOnlineStatus === 'friends_only';
      const presence = getPresenceDetails(rawStatus, canSeeStatus);

      result.push({
        uid: friend.uid,
        username: friend.username,
        created_at: friend.created_at,
        status: presence.status,
        roomCode: presence.roomCode,
        canJoin: presence.canJoin,
        isPrivateRoom: presence.isPrivateRoom,
        statusMessage: friend.status_message,
        avatarConfig: friend.avatar_config
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load friends' });
  }
});

// DELETE friend endpoint
router.delete('/:friendUid', authMiddleware, async (req, res) => {
  try {
    const myUid = req.user.uid;
    const { friendUid } = req.params;
    if (!friendUid) {
      return res.status(400).json({ error: 'Friend UID required' });
    }
    const db = await getDb();
    await db.run('DELETE FROM friends WHERE user_uid = ? AND friend_uid = ?', [myUid, friendUid]);
    await db.run('DELETE FROM friends WHERE user_uid = ? AND friend_uid = ?', [friendUid, myUid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete friend' });
  }
});

module.exports = router;