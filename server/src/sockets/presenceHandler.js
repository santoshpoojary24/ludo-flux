const { getDb } = require('../config/db');
const redis = require('../config/redis');
const { normalizeUserRecord } = require('../utils/profile');

const PRIVATE_ROOM_PREFIXES = ['PRIV-', 'CHALL-'];

const normalizePresenceStatus = (status) => {
    if (!status) return 'offline';
    if (status.startsWith('ingame')) return 'ingame';
    if (status === 'online') return 'online';
    return 'offline';
};

const broadcastStatusToFriends = async (io, uid, status) => {
    try {
        const db = await getDb();
        const owner = normalizeUserRecord(await db.get('SELECT * FROM users WHERE uid = ?', [uid]));
        if (!owner) return;

        const friends = await db.all(`
            SELECT user_uid
            FROM friends
            WHERE friend_uid = ?
              AND NOT EXISTS (
                SELECT 1
                FROM blocked_users b
                WHERE (b.blocker_uid = ? AND b.blocked_uid = user_uid)
                   OR (b.blocker_uid = user_uid AND b.blocked_uid = ?)
              )
        `, [uid, uid, uid]);
        
        friends.forEach(f => {
            io.to(`user:${f.user_uid}`).emit('friend:status_change', {
                uid,
                status:
                    owner.privacy_settings.showOnlineStatus === 'nobody'
                        ? 'offline'
                        : normalizePresenceStatus(status)
            });
        });
    } catch (e) {
        console.error('Error broadcasting presence', e);
    }
};

const setPresence = async (io, uid, status) => {
    if (!uid) return;
    await redis.set(`presence:${uid}`, status);
    await broadcastStatusToFriends(io, uid, status);
};

const challenges = new Map();

const createPrivateRoomCode = () => `PRIV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
const isPrivateRoomCode = (roomCode) => PRIVATE_ROOM_PREFIXES.some(prefix => roomCode?.startsWith(prefix));

const clearChallenge = (challengeId) => {
    const challenge = challenges.get(challengeId);
    if (!challenge) return null;

    clearTimeout(challenge.timeoutId);
    challenges.delete(challengeId);
    return challenge;
};

module.exports = {
    presenceHandler: (io, socket) => {
        socket.on('presence:identify', async ({ uid, username }) => {
            if (!uid) return;
            socket.uid = uid;
            socket.username = username;
            socket.join(`user:${uid}`);
            
            // If they are not ingame already, mark as online
            const current = await redis.get(`presence:${uid}`);
            if (!current || !current.startsWith('ingame')) {
                await setPresence(io, uid, 'online');
            }
        });

        socket.on('challenge:send', async ({ toUid, stake, mode }) => {
            const fromUid = socket.uid;
            if (!fromUid || !toUid) return;
            const db = await getDb();

            const blocked = await db.get(
                `SELECT 1
                 FROM blocked_users
                 WHERE (blocker_uid = ? AND blocked_uid = ?)
                    OR (blocker_uid = ? AND blocked_uid = ?)
                 LIMIT 1`,
                [fromUid, toUid, toUid, fromUid]
            );
            if (blocked) {
                io.to(`user:${fromUid}`).emit('challenge:declined', { toUid, reason: 'blocked' });
                return;
            }

            const targetUser = normalizeUserRecord(await db.get('SELECT * FROM users WHERE uid = ?', [toUid]));
            const friendLink = await db.get(
                `SELECT 1
                 FROM friends
                 WHERE (user_uid = ? AND friend_uid = ?)
                    OR (user_uid = ? AND friend_uid = ?)
                 LIMIT 1`,
                [fromUid, toUid, toUid, fromUid]
            );
            if (!targetUser) {
                io.to(`user:${fromUid}`).emit('challenge:declined', { toUid, reason: 'missing' });
                return;
            }
            if (
                targetUser.privacy_settings.allowChallengeInvites === 'nobody' ||
                (targetUser.privacy_settings.allowChallengeInvites === 'friends_only' && !friendLink)
            ) {
                io.to(`user:${fromUid}`).emit('challenge:declined', { toUid, reason: 'privacy' });
                return;
            }

            const challengeId = `chall_${fromUid}_${Date.now()}`;
            const challenge = {
                id: challengeId,
                fromUid,
                fromUsername: socket.username || 'Friend',
                toUid,
                stake,
                mode,
                expiresAt: Date.now() + 60000
            };

            challenges.set(challengeId, challenge);

            // Notify target
            io.to(`user:${toUid}`).emit('challenge:incoming', challenge);
            io.to(`user:${fromUid}`).emit('challenge:sent', { id: challengeId, toUid, stake, mode });

            // Timeout after 60s
            challenge.timeoutId = setTimeout(() => {
                const expiredChallenge = clearChallenge(challengeId);
                if (expiredChallenge) {
                    io.to(`user:${fromUid}`).emit('challenge:expired', {
                        id: challengeId,
                        toUid,
                        reason: 'timeout'
                    });
                    io.to(`user:${toUid}`).emit('challenge:expired', {
                        id: challengeId,
                        fromUid,
                        reason: 'timeout'
                    });
                }
            }, 60000);
        });

        socket.on('challenge:accept', async ({ challengeId }) => {
            const challenge = clearChallenge(challengeId);
            if (!challenge) return;

            // Create private room code
            const roomCode = createPrivateRoomCode();
            
            // Notify both
            io.to(`user:${challenge.fromUid}`).emit('challenge:accepted', {
                roomCode,
                isPrivate: isPrivateRoomCode(roomCode),
                challenge
            });
            io.to(`user:${challenge.toUid}`).emit('challenge:accepted', {
                roomCode,
                isPrivate: isPrivateRoomCode(roomCode),
                challenge
            });
        });

        socket.on('challenge:decline', async ({ challengeId }) => {
            const challenge = clearChallenge(challengeId);
            if (!challenge) return;

            io.to(`user:${challenge.fromUid}`).emit('challenge:declined', {
                id: challengeId,
                toUid: challenge.toUid
            });
        });

        socket.on('disconnect', async () => {
            if (socket.uid) {
                // Check if they have other open tabs (sockets)
                const sockets = await io.in(`user:${socket.uid}`).fetchSockets();
                if (sockets.length === 0) {
                    await redis.del(`presence:${socket.uid}`);
                    await broadcastStatusToFriends(io, socket.uid, 'offline');
                }
            }
        });
    },
    setPresence
};
