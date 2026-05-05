const express = require('express');
const argon2 = require('argon2');
const { getDb } = require('../config/db');
const redis = require('../config/redis');
const { recordActivity } = require('../utils/activity');
const { authMiddleware, optionalAuthMiddleware, createAuthenticatedResponse } = require('../utils/auth');
const { containsProfanity } = require('../utils/profanityFilter');
const {
  DEFAULT_AVATAR_CONFIG,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_TROPHY_SHELF,
  computeCareerStats,
  fetchUserMatchSnapshots,
  formatPlayTime,
  getFriendsAverageStats,
  getProfileVisibility,
  getRankTier,
  getNextRankTarget,
  getRarityLabel,
  getViewerContext,
  normalizeUserRecord,
  safeJsonParse,
  stableStringify,
  syncUserBadges,
  derivePlayerResult
} = require('../utils/profile');

const deriveResult = derivePlayerResult;

const profileRouter = express.Router();
const accountRouter = express.Router();
const authProfileRouter = express.Router();

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;
const TOKEN_SKINS = ['clay', 'crystal', 'pixel', 'fire', 'ghost', 'gold'];
const BANNER_IDS = [
  'clay-sunrise',
  'board-bloom',
  'soft-confetti',
  'geometry-pop',
  'orbit-grid',
  'mint-waves',
  'coral-mesh',
  'ludo-board',
  'sunset-slices',
  'bubble-party',
  'sprinkle-night',
  'clay-ribbon',
  'season-crown',
  'season-drift',
  'season-stardust'
];
const BANNER_TINTS = ['sky', 'rose', 'mint', 'gold', 'indigo', 'peach', 'teal', 'lavender'];
const AVATAR_OPTIONS = {
  bodyShape: ['round', 'slim', 'square'],
  eyes: ['dots', 'wide', 'sleepy', 'angry', 'sparkle', 'wink'],
  mouth: ['smile', 'grin', 'flat', 'smirk', 'open', 'cool'],
  accessory: ['none', 'crown', 'wizard_hat', 'headband', 'halo', 'cat_ears'],
  outfitColor: ['red', 'green', 'yellow', 'blue', 'mint', 'rose', 'violet', 'peach'],
  frame: ['default', 'bronze', 'silver', 'gold', 'diamond']
};

const formatHidden = (message = 'This profile is private.') => ({
  hidden: true,
  message
});

const getProfileByUid = async (db, uid) => {
  const user = await db.get('SELECT * FROM users WHERE uid = ?', [uid]);
  return normalizeUserRecord(user);
};

const getPresenceForViewer = async (profileUser, visibility) => {
  if (!visibility.onlineStatus) {
    return 'offline';
  }

  const rawStatus = await redis.get(`presence:${profileUser.uid}`);
  if (!rawStatus) return 'offline';
  if (rawStatus.startsWith('ingame')) return 'ingame';
  return rawStatus;
};

const getMutualFriendIds = async (db, uid) => {
  const rows = await db.all(
    `SELECT DISTINCT CASE
      WHEN user_uid = ? THEN friend_uid
      ELSE user_uid
     END AS uid
     FROM friends
     WHERE user_uid = ? OR friend_uid = ?`,
    [uid, uid, uid]
  );
  return new Set(rows.map((row) => row.uid));
};

const getCoinTransactionReason = (amount, reason = '') => ({
  amount,
  reason
});

const awardNewBadges = async (req, profileUser, stats) => {
  const db = await getDb();
  const newlyEarned = await syncUserBadges(db, profileUser, stats);
  if (!newlyEarned.length) {
    return;
  }

  const io = req.app.get('io');
  if (!io) {
    return;
  }

  for (const badge of newlyEarned) {
    await recordActivity(io, profileUser.uid, 'badge', { badgeName: badge.name });
  }
};

const buildSummaryResponse = async (req, profileUser, viewerContext, visibility) => {
  const db = await getDb();
  const pinnedBadges = await db.all(
    `SELECT ub.badge_key, ub.earned_at, bd.name, bd.icon
     FROM user_badges ub
     JOIN badge_definitions bd ON bd.badge_key = ub.badge_key
     WHERE ub.user_uid = ? AND ub.is_pinned = 1 AND ub.earned_at IS NOT NULL
     ORDER BY ub.earned_at DESC
     LIMIT 3`,
    [profileUser.uid]
  );

  const trophyShelf = Array.isArray(profileUser.trophy_shelf)
    ? profileUser.trophy_shelf.slice(0, 6)
    : DEFAULT_TROPHY_SHELF;

  return {
    uid: profileUser.uid,
    username: profileUser.username,
    email: viewerContext.isSelf ? profileUser.email : '',
    avatarConfig: profileUser.avatar_config,
    bannerId: profileUser.banner_id,
    bannerTint: profileUser.banner_tint,
    tokenSkin: profileUser.token_skin,
    statusMessage: profileUser.status_message,
    trophyShelf,
    pinnedBadges,
    accountType: profileUser.account_type,
    elo: viewerContext.isSelf ? profileUser.elo : undefined,
    coins: visibility.coinBalance ? profileUser.coins : null,
    privacySettings: viewerContext.isSelf ? profileUser.privacy_settings : null,
    notificationPrefs: viewerContext.isSelf ? profileUser.notification_prefs : null,
    onlineStatus: await getPresenceForViewer(profileUser, visibility),
    viewerContext,
    visibility,
    actions: {
      canEdit: viewerContext.isSelf,
      canBlock: Boolean(viewerContext.viewerUid) && !viewerContext.isSelf,
      isBlocked: viewerContext.blockedByViewer,
      canChallenge:
        !viewerContext.isSelf &&
        !viewerContext.isBlockedEitherWay &&
        (profileUser.privacy_settings.allowChallengeInvites === 'everyone' ||
          (profileUser.privacy_settings.allowChallengeInvites === 'friends_only' && viewerContext.isFriend)),
      canFriendRequest:
        !viewerContext.isSelf &&
        !viewerContext.isBlockedEitherWay &&
        profileUser.privacy_settings.allowFriendRequests === 'everyone'
    }
  };
};

const requireOwner = (res, viewerContext) => {
  if (!viewerContext.isSelf) {
    res.status(403).json({ error: 'Private section' });
    return false;
  }

  return true;
};

const validateUsername = (value) => USERNAME_REGEX.test(value || '');

const getProfileContext = async (req, res, options = {}) => {
  const db = await getDb();
  const profileUser = await getProfileByUid(db, options.uid || req.params.uid || req.user?.uid);
  if (!profileUser) {
    res.status(404).json({ error: 'Profile not found' });
    return null;
  }

  if (profileUser.deactivated_at && req.user?.uid !== profileUser.uid) {
    res.status(404).json({ error: 'Profile not found' });
    return null;
  }

  const viewerContext = await getViewerContext(db, req.user?.uid, profileUser.uid);
  const visibility = getProfileVisibility(profileUser.privacy_settings, viewerContext);

  return { db, profileUser, viewerContext, visibility };
};

const emitProfileUpdateToFriends = async (io, db, uid, eventName, payload) => {
  const friends = await db.all(
    `SELECT DISTINCT CASE
      WHEN user_uid = ? THEN friend_uid
      ELSE user_uid
     END AS uid
     FROM friends
     WHERE user_uid = ? OR friend_uid = ?`,
    [uid, uid, uid]
  );

  io.to(`user:${uid}`).emit(eventName, payload);
  friends.forEach((friend) => {
    io.to(`user:${friend.uid}`).emit(eventName, payload);
  });
};

profileRouter.get('/:uid/summary', optionalAuthMiddleware, async (req, res) => {
  const context = await getProfileContext(req, res);
  if (!context) return;

  const { profileUser, viewerContext, visibility } = context;
  const matches = await fetchUserMatchSnapshots(context.db, profileUser.uid);
  const stats = computeCareerStats(matches);
  await awardNewBadges(req, profileUser, stats);

  res.json(await buildSummaryResponse(req, profileUser, viewerContext, visibility));
});

profileRouter.get('/:uid/stats', optionalAuthMiddleware, async (req, res) => {
  const context = await getProfileContext(req, res);
  if (!context) return;

  const { db, profileUser, viewerContext, visibility } = context;
  if (!visibility.stats) {
    return res.json(formatHidden());
  }

  const matches = await fetchUserMatchSnapshots(db, profileUser.uid);
  const stats = computeCareerStats(matches);
  await awardNewBadges(req, profileUser, stats);

  const friendsAverage = viewerContext.isSelf
    ? await getFriendsAverageStats(db, profileUser.uid)
    : null;

  res.json({
    ...stats,
    totalPlayTimeFormatted: formatPlayTime(stats.totalPlayTimeSeconds),
    friendsAverage
  });
});

profileRouter.get('/:uid/performance', optionalAuthMiddleware, async (req, res) => {
  const context = await getProfileContext(req, res);
  if (!context) return;

  const { db, profileUser, visibility } = context;
  if (!visibility.stats) {
    return res.json(formatHidden());
  }

  const matches = await fetchUserMatchSnapshots(db, profileUser.uid);
  const tab = req.query.tab || 'winrate';

  if (matches.length < 3) {
    return res.json({ tab, points: [], empty: true });
  }

  if (tab === 'efficiency') {
    return res.json({
      tab,
      empty: false,
      points: matches.slice(0, 10).reverse().map((match, index) => ({
        label: `Match ${index + 1}`,
        tokensHome: Number(match.player.tokensHome || 0),
        tokensLost: Number(match.player.timesCaptured || 0),
        result: deriveResult(match)
      }))
    });
  }

  if (tab === 'dice') {
    const stats = computeCareerStats(matches);
    return res.json({
      tab,
      empty: false,
      distribution: Object.entries(stats.diceDistribution).map(([face, count]) => ({
        face,
        count
      }))
    });
  }

  const weekMap = new Map();
  const now = new Date();
  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset * 7);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const key = start.toISOString().slice(0, 10);
    weekMap.set(key, { week: key, wins: 0, total: 0 });
  }

  matches.forEach((match) => {
    const playedAt = new Date(match.played_at || match.created_at);
    const weekStart = new Date(playedAt);
    weekStart.setDate(playedAt.getDate() - playedAt.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    if (!weekMap.has(key)) return;
    const entry = weekMap.get(key);
    entry.total += 1;
    if (deriveResult(match) === 'win') {
      entry.wins += 1;
    }
  });

  res.json({
    tab: 'winrate',
    empty: false,
    points: [...weekMap.values()].map((entry) => ({
      week: entry.week,
      winRate: entry.total ? Number(((entry.wins / entry.total) * 100).toFixed(1)) : 0
    }))
  });
});

profileRouter.get('/:uid/achievements', optionalAuthMiddleware, async (req, res) => {
  const context = await getProfileContext(req, res);
  if (!context) return;

  const { db, profileUser } = context;
  const matches = await fetchUserMatchSnapshots(db, profileUser.uid);
  const stats = computeCareerStats(matches);
  await awardNewBadges(req, profileUser, stats);

  const definitions = await db.all('SELECT * FROM badge_definitions ORDER BY name ASC');
  const badges = await db.all(
    `SELECT ub.*, bd.name, bd.description, bd.icon, bd.condition_type, bd.condition_value, bd.unlock_text, bd.earn_count
     FROM user_badges ub
     JOIN badge_definitions bd ON bd.badge_key = ub.badge_key
     WHERE ub.user_uid = ?`,
    [profileUser.uid]
  );
  const totalUsersRow = await db.get(
    `SELECT COUNT(*) AS count
     FROM users
     WHERE deactivated_at IS NULL`
  );
  const totalUsers = Math.max(Number(totalUsersRow?.count) || 1, 1);
  const byKey = new Map(badges.map((badge) => [badge.badge_key, badge]));

  const items = definitions.map((definition) => {
    const userBadge = byKey.get(definition.badge_key) || {};
    const earnRate = Number(((definition.earn_count / totalUsers) * 100).toFixed(1));
    return {
      badgeKey: definition.badge_key,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      progress: Number(userBadge.progress || 0),
      target: definition.condition_value,
      earnedAt: userBadge.earned_at || null,
      isPinned: Boolean(userBadge.is_pinned),
      earnRate,
      rarity: getRarityLabel(earnRate),
      unlockText: definition.unlock_text
    };
  });

  res.json({
    items,
    pinned: items.filter((item) => item.isPinned).slice(0, 3)
  });
});

profileRouter.put('/badges/pins', authMiddleware, async (req, res) => {
  const { badgeKeys = [] } = req.body;
  if (!Array.isArray(badgeKeys) || badgeKeys.length > 3) {
    return res.status(400).json({ error: 'Select up to 3 badges' });
  }

  const db = await getDb();
  await db.run('UPDATE user_badges SET is_pinned = 0 WHERE user_uid = ?', [req.user.uid]);

  for (const badgeKey of badgeKeys) {
    await db.run(
      `UPDATE user_badges
       SET is_pinned = 1
       WHERE user_uid = ? AND badge_key = ? AND earned_at IS NOT NULL`,
      [req.user.uid, badgeKey]
    );
  }

  res.json({ success: true });
});

profileRouter.get('/:uid/matches', optionalAuthMiddleware, async (req, res) => {
  const context = await getProfileContext(req, res);
  if (!context) return;

  const { db, profileUser, visibility } = context;
  if (!visibility.matchHistory) {
    return res.json(formatHidden());
  }

  const filter = (req.query.filter || 'all').toLowerCase();
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.max(Number(req.query.limit || 10), 1);
  const friendIds = await getMutualFriendIds(db, profileUser.uid);
  const matches = await fetchUserMatchSnapshots(db, profileUser.uid);

  const filtered = matches.filter((match) => {
    const result = deriveResult(match);
    const opponents = match.players.filter((player) => player.uid !== profileUser.uid);

    if (filter === 'wins') return result === 'win';
    if (filter === 'losses') return result === 'loss';
    if (filter === 'vs friends') {
      return opponents.some((player) => friendIds.has(player.uid));
    }
    if (filter === 'bot games') {
      return opponents.some((player) => player.isBot);
    }
    return true;
  });

  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map((match) => {
    const result = deriveResult(match);
    const opponents = match.players.filter((player) => player.uid !== profileUser.uid);
    const diceRolls = match.player.diceRolls || match.diceRolls[match.player.uid] || {};
    return {
      id: match.id,
      roomCode: match.room_code,
      result,
      opponents: opponents.slice(0, 3).map((player) => ({
        uid: player.uid,
        username: player.username,
        avatarConfig: player.avatarConfig || null
      })),
      durationSeconds: Number(match.duration_seconds || match.duration || 0),
      playedAt: match.played_at || match.created_at,
      gameMode: match.game_mode || 'Classic',
      tokensHome: Number(match.player.tokensHome || 0),
      summary: `${Number(match.player.tokensHome || 0)}/4 tokens home`,
      details: {
        players: match.players,
        captures: match.captures,
        diceRolls,
        tokenStats: match.tokenStats
      }
    };
  });

  res.json({
    items,
    hasMore: start + limit < filtered.length
  });
});

profileRouter.get('/:uid/rank', authMiddleware, async (req, res) => {
  const context = await getProfileContext(req, res);
  if (!context) return;
  if (!requireOwner(res, context.viewerContext)) return;

  const { db, profileUser } = context;
  const matches = await fetchUserMatchSnapshots(db, profileUser.uid);
  const history = matches.slice(0, 20).reverse().map((match, index) => ({
    label: `Match ${index + 1}`,
    elo: Number(profileUser.elo || 600) - matches.slice(0, 20).reverse().slice(index + 1).reduce((sum, item) => sum + Number(item.player.eloDelta || 0), 0),
    eloDelta: Number(match.player.eloDelta || 0),
    result: deriveResult(match),
    opponents: match.players.filter((player) => player.uid !== profileUser.uid).map((player) => player.username)
  }));
  const rankTier = getRankTier(profileUser.elo);
  const progress = getNextRankTarget(profileUser.elo);

  res.json({
    elo: profileUser.elo,
    rankTier,
    progress,
    history
  });
});

profileRouter.put('/avatar', authMiddleware, async (req, res) => {
  const avatarConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    ...(req.body.avatarConfig || {})
  };

  for (const [key, allowedValues] of Object.entries(AVATAR_OPTIONS)) {
    if (!allowedValues.includes(avatarConfig[key])) {
      return res.status(400).json({ error: `Invalid avatar option: ${key}` });
    }
  }

  const db = await getDb();
  await db.run(
    'UPDATE users SET avatar_config = ? WHERE uid = ?',
    [stableStringify(avatarConfig), req.user.uid]
  );

  const io = req.app.get('io');
  if (io) {
    await emitProfileUpdateToFriends(io, db, req.user.uid, 'profile:avatar_updated', {
      uid: req.user.uid,
      avatarConfig
    });
  }

  res.json({ success: true, avatarConfig });
});

profileRouter.put('/banner', authMiddleware, async (req, res) => {
  const { banner_id: bannerId, tint } = req.body;
  if (!BANNER_IDS.includes(bannerId) || !BANNER_TINTS.includes(tint)) {
    return res.status(400).json({ error: 'Invalid banner selection' });
  }

  const db = await getDb();
  await db.run(
    'UPDATE users SET banner_id = ?, banner_tint = ? WHERE uid = ?',
    [bannerId, tint, req.user.uid]
  );

  res.json({ success: true, bannerId, tint });
});

profileRouter.put('/token-skin', authMiddleware, async (req, res) => {
  const { tokenSkin } = req.body;
  if (!TOKEN_SKINS.includes(tokenSkin)) {
    return res.status(400).json({ error: 'Invalid token skin' });
  }

  const db = await getDb();
  await db.run(
    'UPDATE users SET token_skin = ? WHERE uid = ?',
    [tokenSkin, req.user.uid]
  );

  res.json({ success: true, tokenSkin });
});

profileRouter.patch('/status', authMiddleware, async (req, res) => {
  const nextStatus = (req.body.statusMessage || '').trim().slice(0, 60);
  if (containsProfanity(nextStatus)) {
    return res.status(400).json({ error: 'Status contains blocked language' });
  }

  const db = await getDb();
  await db.run(
    'UPDATE users SET status_message = ? WHERE uid = ?',
    [nextStatus, req.user.uid]
  );

  const io = req.app.get('io');
  if (io) {
    await emitProfileUpdateToFriends(io, db, req.user.uid, 'profile:status_updated', {
      uid: req.user.uid,
      statusMessage: nextStatus
    });
  }

  res.json({ success: true, statusMessage: nextStatus });
});

profileRouter.put('/trophy-shelf', authMiddleware, async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 6) : [];
  const db = await getDb();
  await db.run(
    'UPDATE users SET trophy_shelf = ? WHERE uid = ?',
    [stableStringify(items), req.user.uid]
  );

  res.json({ success: true, items });
});

profileRouter.patch('/privacy', authMiddleware, async (req, res) => {
  const nextSettings = {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...(req.body || {})
  };

  const db = await getDb();
  await db.run(
    'UPDATE users SET privacy_settings = ? WHERE uid = ?',
    [stableStringify(nextSettings), req.user.uid]
  );

  res.json({ success: true, privacySettings: nextSettings });
});

profileRouter.patch('/notification-prefs', authMiddleware, async (req, res) => {
  const nextPrefs = {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...(req.body || {})
  };

  const db = await getDb();
  await db.run(
    'UPDATE users SET notification_prefs = ? WHERE uid = ?',
    [stableStringify(nextPrefs), req.user.uid]
  );

  res.json({ success: true, notificationPrefs: nextPrefs });
});

profileRouter.get('/blocked/list', authMiddleware, async (req, res) => {
  const db = await getDb();
  const items = await db.all(
    `SELECT b.blocked_uid AS uid, b.created_at, u.username, u.avatar_config
     FROM blocked_users b
     JOIN users u ON u.uid = b.blocked_uid
     WHERE b.blocker_uid = ?
     ORDER BY b.created_at DESC`,
    [req.user.uid]
  );

  res.json(
    items.map((item) => ({
      ...item,
      avatarConfig: safeJsonParse(item.avatar_config, DEFAULT_AVATAR_CONFIG)
    }))
  );
});

profileRouter.post('/blocked', authMiddleware, async (req, res) => {
  const { blockedUid } = req.body;
  if (!blockedUid || blockedUid === req.user.uid) {
    return res.status(400).json({ error: 'Invalid user' });
  }

  const db = await getDb();
  await db.run(
    `INSERT INTO blocked_users (blocker_uid, blocked_uid)
     VALUES (?, ?) ON CONFLICT DO NOTHING`,
    [req.user.uid, blockedUid]
  );
  await db.run(
    `DELETE FROM friends
     WHERE (user_uid = ? AND friend_uid = ?)
        OR (user_uid = ? AND friend_uid = ?)`,
    [req.user.uid, blockedUid, blockedUid, req.user.uid]
  );

  res.json({ success: true });
});

profileRouter.delete('/blocked/:uid', authMiddleware, async (req, res) => {
  const db = await getDb();
  await db.run(
    'DELETE FROM blocked_users WHERE blocker_uid = ? AND blocked_uid = ?',
    [req.user.uid, req.params.uid]
  );
  res.json({ success: true });
});

accountRouter.post('/export', authMiddleware, async (req, res) => {
  const db = await getDb();
  const user = await getProfileByUid(db, req.user.uid);
  const matches = await db.all(
    'SELECT * FROM match_history WHERE players_json LIKE ? ORDER BY played_at DESC',
    [`%${req.user.uid}%`]
  );
  const badges = await db.all(
    `SELECT ub.*, bd.name, bd.description
     FROM user_badges ub
     JOIN badge_definitions bd ON bd.badge_key = ub.badge_key
     WHERE ub.user_uid = ?`,
    [req.user.uid]
  );
  const friends = await db.all(
    `SELECT u.uid, u.username
     FROM friends f
     JOIN users u ON u.uid = f.friend_uid
     WHERE f.user_uid = ?`,
    [req.user.uid]
  );
  const coinTransactions = await db.all(
    'SELECT amount, reason, created_at FROM coin_transactions WHERE user_uid = ? ORDER BY created_at DESC',
    [req.user.uid]
  );

  res.json({
    exportedAt: new Date().toISOString(),
    profile: user,
    matchHistory: matches.map((match) => ({
      ...match,
      players_json: safeJsonParse(match.players_json, []),
      captures_json: safeJsonParse(match.captures_json, []),
      dice_rolls_json: safeJsonParse(match.dice_rolls_json, {})
    })),
    badges,
    friends,
    coinTransactions
  });
});

accountRouter.post('/deactivate', authMiddleware, async (req, res) => {
  const db = await getDb();
  await db.run(
    `UPDATE users
     SET deactivated_at = CURRENT_TIMESTAMP,
         deletion_scheduled_at = NOW() + INTERVAL '30 days'
     WHERE uid = ?`,
    [req.user.uid]
  );
  res.json({ success: true });
});

accountRouter.post('/reactivate', authMiddleware, async (req, res) => {
  const db = await getDb();
  await db.run(
    `UPDATE users
     SET deactivated_at = NULL,
         deletion_scheduled_at = NULL
     WHERE uid = ?`,
    [req.user.uid]
  );
  res.json({ success: true });
});

authProfileRouter.get('/check-username', optionalAuthMiddleware, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!validateUsername(q)) {
    return res.json({ available: false, reason: '3-20 chars, letters, numbers, underscore only' });
  }

  const db = await getDb();
  const existing = await db.get(
    'SELECT uid FROM users WHERE LOWER(username) = LOWER(?)',
    [q]
  );
  const available = !existing || existing.uid === req.user?.uid;
  res.json({ available });
});

authProfileRouter.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (!/^.*(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword || '')) {
    return res.status(400).json({ error: 'Password must be 8+ chars with 1 uppercase and 1 number' });
  }

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
  const valid = await argon2.verify(user.password_hash, currentPassword);
  if (!valid) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await argon2.hash(newPassword);
  await db.run('UPDATE users SET password_hash = ? WHERE uid = ?', [passwordHash, req.user.uid]);
  res.json({ success: true });
});

authProfileRouter.get('/sessions', authMiddleware, async (req, res) => {
  const db = await getDb();
  const sessions = await db.all(
    `SELECT id, device_info, ip_address, last_seen, created_at
     FROM user_sessions
     WHERE user_uid = ?
     ORDER BY last_seen DESC`,
    [req.user.uid]
  );
  res.json(
    sessions.map((session) => ({
      ...session,
      isCurrent: session.id === req.user.sessionId
    }))
  );
});

authProfileRouter.delete('/sessions/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  if (req.params.id === 'others') {
    await db.run(
      'DELETE FROM user_sessions WHERE user_uid = ? AND id != ?',
      [req.user.uid, req.user.sessionId || '']
    );
    return res.json({ success: true });
  }

  await db.run(
    'DELETE FROM user_sessions WHERE id = ? AND user_uid = ?',
    [req.params.id, req.user.uid]
  );
  res.json({ success: true });
});

authProfileRouter.post('/convert-guest', authMiddleware, async (req, res) => {
  const { email, password, username } = req.body;
  if (!validateUsername(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 chars and use letters, numbers, underscores only' });
  }
  if (!/^.*(?=.*[A-Z])(?=.*\d).{8,}$/.test(password || '')) {
    return res.status(400).json({ error: 'Password must be 8+ chars with 1 uppercase and 1 number' });
  }

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
  if (!user || user.account_type !== 'guest') {
    return res.status(400).json({ error: 'Only guest accounts can be converted' });
  }

  const existingEmail = await db.get('SELECT uid FROM users WHERE email = ? AND uid != ?', [email, req.user.uid]);
  const existingUsername = await db.get('SELECT uid FROM users WHERE LOWER(username) = LOWER(?) AND uid != ?', [username, req.user.uid]);
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  if (existingUsername) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const passwordHash = await argon2.hash(password);
  await db.run(
    `UPDATE users
     SET email = ?, password_hash = ?, username = ?, account_type = 'registered'
     WHERE uid = ?`,
    [email, passwordHash, username, req.user.uid]
  );

  const refreshed = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
  const response = await createAuthenticatedResponse(refreshed, req);
  res.json(response);
});

authProfileRouter.patch('/username', authMiddleware, async (req, res) => {
  const { username } = req.body;
  if (!validateUsername(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
  if (!user || user.coins < 200) {
    return res.status(400).json({ error: 'Not enough coins' });
  }

  const existing = await db.get(
    'SELECT uid FROM users WHERE LOWER(username) = LOWER(?) AND uid != ?',
    [username, req.user.uid]
  );
  if (existing) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  await db.run(
    'UPDATE users SET username = ?, coins = coins - 200 WHERE uid = ?',
    [username, req.user.uid]
  );
  await db.run(
    'INSERT INTO coin_transactions (user_uid, amount, reason) VALUES (?, ?, ?)',
    [req.user.uid, -200, 'username_change']
  );

  const updated = await db.get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
  res.json({
    success: true,
    user: {
      uid: updated.uid,
      username: updated.username,
      coins: updated.coins,
      elo: updated.elo,
      accountType: updated.account_type
    }
  });
});

module.exports = {
  profileRouter,
  accountRouter,
  authProfileRouter
};
