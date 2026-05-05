const DEFAULT_AVATAR_CONFIG = {
  bodyShape: 'round',
  eyes: 'dots',
  mouth: 'smile',
  accessory: 'none',
  outfitColor: 'blue',
  frame: 'default'
};

const DEFAULT_PRIVACY_SETTINGS = {
  showOnlineStatus: 'friends_only',
  showMatchHistory: 'friends_only',
  showStats: 'friends_only',
  showCoinBalance: 'nobody',
  allowFriendRequests: 'everyone',
  allowChallengeInvites: 'friends_only'
};

const DEFAULT_NOTIFICATION_PREFS = {
  'social.friend_request_received': true,
  'social.friend_accepted': true,
  'social.friend_online': true,
  'game.turn_reminder': true,
  'game.match_result_summary': true,
  'game.challenge_received': true,
  'game.tournament_match_ready': true,
  'rewards.badge_awarded': true,
  'rewards.quest_completed': true,
  'rewards.season_reward_claimable': true,
  'rewards.daily_spin_reminder': true
};

const DEFAULT_TROPHY_SHELF = [];

const safeJsonParse = (value, fallback) => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const stableStringify = (value, fallback = null) => JSON.stringify(value ?? fallback);

const normalizeUserRecord = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    avatar_config: safeJsonParse(user.avatar_config, DEFAULT_AVATAR_CONFIG),
    privacy_settings: {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...safeJsonParse(user.privacy_settings, {})
    },
    notification_prefs: {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...safeJsonParse(user.notification_prefs, {})
    },
    trophy_shelf: safeJsonParse(user.trophy_shelf, DEFAULT_TROPHY_SHELF),
    status_message: user.status_message || '',
    banner_id: user.banner_id || 'clay-sunrise',
    banner_tint: user.banner_tint || 'sky',
    token_skin: user.token_skin || 'clay',
    account_type: user.account_type || 'registered',
    elo: user.elo || 600
  };
};

const canViewAudience = (audience, viewerContext) => {
  if (viewerContext.isSelf) return true;
  if (audience === 'everyone') return true;
  if (audience === 'friends_only') return viewerContext.isFriend;
  return false;
};

const getViewerContext = async (db, viewerUid, profileUid) => {
  const isSelf = Boolean(viewerUid) && viewerUid === profileUid;
  let isFriend = false;
  let blockedByViewer = false;
  let blockedViewer = false;

  if (viewerUid && profileUid && !isSelf) {
    const friendRow = await db.get(
      `SELECT 1
       FROM friends
       WHERE (user_uid = ? AND friend_uid = ?)
          OR (user_uid = ? AND friend_uid = ?)
       LIMIT 1`,
      [viewerUid, profileUid, profileUid, viewerUid]
    );
    const viewerBlock = await db.get(
      'SELECT 1 FROM blocked_users WHERE blocker_uid = ? AND blocked_uid = ?',
      [viewerUid, profileUid]
    );
    const blockedViewerRow = await db.get(
      'SELECT 1 FROM blocked_users WHERE blocker_uid = ? AND blocked_uid = ?',
      [profileUid, viewerUid]
    );

    isFriend = Boolean(friendRow);
    blockedByViewer = Boolean(viewerBlock);
    blockedViewer = Boolean(blockedViewerRow);
  }

  return {
    viewerUid,
    profileUid,
    isSelf,
    isFriend,
    blockedByViewer,
    blockedViewer,
    isBlockedEitherWay: blockedByViewer || blockedViewer
  };
};

const getProfileVisibility = (privacySettings, viewerContext) => ({
  stats: canViewAudience(privacySettings.showStats, viewerContext),
  matchHistory: canViewAudience(privacySettings.showMatchHistory, viewerContext),
  onlineStatus: canViewAudience(privacySettings.showOnlineStatus, viewerContext),
  coinBalance: viewerContext.isSelf
    ? true
    : canViewAudience(privacySettings.showCoinBalance, viewerContext)
});

const getRankTier = (elo = 0) => {
  if (elo >= 2500) return 'Legend';
  if (elo >= 2000) return 'Diamond';
  if (elo >= 1500) return 'Platinum';
  if (elo >= 1000) return 'Gold';
  if (elo >= 500) return 'Silver';
  return 'Bronze';
};

const getNextRankTarget = (elo = 0) => {
  const thresholds = [0, 500, 1000, 1500, 2000, 2500];
  const current = thresholds.filter((value) => value <= elo).pop() ?? 0;
  const next = thresholds.find((value) => value > elo) ?? 2500;
  return { current, next };
};

const aggregateDice = (target, source = {}) => {
  for (let face = 1; face <= 6; face += 1) {
    target[face] += Number(source[face] || 0);
  }
};

const findPlayerSnapshot = (match, userUid) => {
  const players = safeJsonParse(match.players_json, []);
  if (!Array.isArray(players)) {
    return null;
  }

  const player = players.find((entry) => entry?.uid === userUid);
  if (!player) {
    return null;
  }

  return {
    ...match,
    players,
    player,
    captures: safeJsonParse(match.captures_json, []),
    diceRolls: safeJsonParse(match.dice_rolls_json, {}),
    tokenStats: safeJsonParse(match.token_stats_json, {}),
    resultSummary: safeJsonParse(match.result_json, {})
  };
};

const derivePlayerResult = (snapshot) => {
  if (snapshot.player.result) {
    return snapshot.player.result;
  }

  if (snapshot.winner === snapshot.player.color || snapshot.winner_uid === snapshot.player.uid) {
    return 'win';
  }

  if (!snapshot.winner && !snapshot.winner_uid) {
    return 'draw';
  }

  return 'loss';
};

const computeCareerStats = (matches) => {
  const totals = {
    totalMatchesPlayed: 0,
    totalWins: 0,
    winRate: 0,
    totalTokensSentHome: 0,
    totalTokensCaptured: 0,
    totalTimesCaptured: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    favouriteColour: 'None',
    totalPlayTimeSeconds: 0,
    diceDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    spinCount: 0
  };

  const orderedAsc = [...matches].sort(
    (left, right) => new Date(left.played_at || left.created_at) - new Date(right.played_at || right.created_at)
  );
  const colourCounts = {};
  let runningWinStreak = 0;

  orderedAsc.forEach((snapshot) => {
    const result = derivePlayerResult(snapshot);
    const player = snapshot.player;
    totals.totalMatchesPlayed += 1;
    totals.totalTokensSentHome += Number(player.tokensHome || 0);
    totals.totalTokensCaptured += Number(player.capturesMade || 0);
    totals.totalTimesCaptured += Number(player.timesCaptured || 0);
    totals.totalPlayTimeSeconds += Number(player.playTimeSeconds || snapshot.duration_seconds || snapshot.duration || 0);

    if (player.color) {
      colourCounts[player.color] = (colourCounts[player.color] || 0) + 1;
    }

    aggregateDice(
      totals.diceDistribution,
      player.diceRolls || snapshot.diceRolls[player.uid] || snapshot.diceRolls[player.color] || {}
    );

    if (result === 'win') {
      totals.totalWins += 1;
      runningWinStreak += 1;
      totals.bestWinStreak = Math.max(totals.bestWinStreak, runningWinStreak);
    } else {
      runningWinStreak = 0;
    }
  });

  const orderedDesc = [...orderedAsc].reverse();
  for (const snapshot of orderedDesc) {
    if (derivePlayerResult(snapshot) === 'win') {
      totals.currentWinStreak += 1;
    } else {
      break;
    }
  }

  totals.winRate = totals.totalMatchesPlayed
    ? Number(((totals.totalWins / totals.totalMatchesPlayed) * 100).toFixed(1))
    : 0;

  const favourite = Object.entries(colourCounts).sort((left, right) => right[1] - left[1])[0];
  totals.favouriteColour = favourite ? favourite[0] : 'None';

  return totals;
};

const fetchUserMatchSnapshots = async (db, userUid) => {
  const rows = await db.all(
    `SELECT *
     FROM match_history
     WHERE players_json LIKE ?
        OR winner_uid = ?
     ORDER BY COALESCE(played_at, created_at) DESC`,
    [`%${userUid}%`, userUid]
  );

  return rows
    .map((row) => findPlayerSnapshot(row, userUid))
    .filter(Boolean);
};

const formatPlayTime = (seconds = 0) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const calculateBadgeProgressValue = async (db, user, stats, definition) => {
  switch (definition.condition_type) {
    case 'matches_played':
      return stats.totalMatchesPlayed;
    case 'tokens_captured':
      return stats.totalTokensCaptured;
    case 'win_streak':
      return stats.bestWinStreak;
    case 'elo':
      return user.elo || 0;
    case 'spin_count': {
      const row = await db.get(
        `SELECT COUNT(*) AS spin_count
         FROM activity_feed
         WHERE user_uid = ? AND event_type = 'spin'`,
        [user.uid]
      );
      return row?.spin_count || 0;
    }
    default:
      return 0;
  }
};

const syncUserBadges = async (db, user, stats) => {
  const definitions = await db.all('SELECT * FROM badge_definitions ORDER BY id ASC');
  const existingRows = await db.all('SELECT * FROM user_badges WHERE user_uid = ?', [user.uid]);
  const byKey = new Map(existingRows.map((row) => [row.badge_key, row]));
  const newlyEarned = [];

  for (const definition of definitions) {
    const progress = await calculateBadgeProgressValue(db, user, stats, definition);
    const earned = progress >= definition.condition_value;
    
    // Ensure row exists
    await db.run(
      `INSERT INTO user_badges (user_uid, badge_key, progress, is_pinned)
       VALUES (?, ?, 0, 0) ON CONFLICT DO NOTHING`,
      [user.uid, definition.badge_key]
    );

    const current = await db.get(
      'SELECT * FROM user_badges WHERE user_uid = ? AND badge_key = ?',
      [user.uid, definition.badge_key]
    );

    const wasEarned = Boolean(current.earned_at);
    const newlyEarnedAt = wasEarned ? current.earned_at : (earned ? new Date().toISOString() : null);

    await db.run(
      `UPDATE user_badges
       SET progress = ?, earned_at = ?
       WHERE id = ?`,
      [progress, newlyEarnedAt, current.id]
    );

    if (!wasEarned && earned) {
      await db.run(
        'UPDATE badge_definitions SET earn_count = earn_count + 1 WHERE badge_key = ?',
        [definition.badge_key]
      );
      newlyEarned.push(definition);
    }
  }

  return newlyEarned;
};

const getRarityLabel = (earnRatePercent) => {
  if (earnRatePercent < 5) return 'Legendary';
  if (earnRatePercent < 15) return 'Epic';
  if (earnRatePercent < 40) return 'Rare';
  return 'Common';
};

const getFriendsAverageStats = async (db, userUid) => {
  const friendRows = await db.all(
    `SELECT DISTINCT CASE
      WHEN user_uid = ? THEN friend_uid
      ELSE user_uid
     END AS uid
     FROM friends
     WHERE user_uid = ? OR friend_uid = ?`,
    [userUid, userUid, userUid]
  );

  const statsList = [];
  for (const friend of friendRows) {
    const snapshots = await fetchUserMatchSnapshots(db, friend.uid);
    if (!snapshots.length) continue;
    statsList.push(computeCareerStats(snapshots));
  }

  if (!statsList.length) {
    return null;
  }

  const total = statsList.reduce(
    (accumulator, entry) => ({
      totalMatchesPlayed: accumulator.totalMatchesPlayed + entry.totalMatchesPlayed,
      totalWins: accumulator.totalWins + entry.totalWins,
      winRate: accumulator.winRate + entry.winRate,
      totalTokensSentHome: accumulator.totalTokensSentHome + entry.totalTokensSentHome,
      totalTokensCaptured: accumulator.totalTokensCaptured + entry.totalTokensCaptured,
      totalTimesCaptured: accumulator.totalTimesCaptured + entry.totalTimesCaptured,
      currentWinStreak: accumulator.currentWinStreak + entry.currentWinStreak,
      bestWinStreak: accumulator.bestWinStreak + entry.bestWinStreak,
      totalPlayTimeSeconds: accumulator.totalPlayTimeSeconds + entry.totalPlayTimeSeconds
    }),
    {
      totalMatchesPlayed: 0,
      totalWins: 0,
      winRate: 0,
      totalTokensSentHome: 0,
      totalTokensCaptured: 0,
      totalTimesCaptured: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      totalPlayTimeSeconds: 0
    }
  );

  const divisor = statsList.length;
  return {
    totalMatchesPlayed: Number((total.totalMatchesPlayed / divisor).toFixed(1)),
    totalWins: Number((total.totalWins / divisor).toFixed(1)),
    winRate: Number((total.winRate / divisor).toFixed(1)),
    totalTokensSentHome: Number((total.totalTokensSentHome / divisor).toFixed(1)),
    totalTokensCaptured: Number((total.totalTokensCaptured / divisor).toFixed(1)),
    totalTimesCaptured: Number((total.totalTimesCaptured / divisor).toFixed(1)),
    currentWinStreak: Number((total.currentWinStreak / divisor).toFixed(1)),
    bestWinStreak: Number((total.bestWinStreak / divisor).toFixed(1)),
    totalPlayTimeSeconds: Number((total.totalPlayTimeSeconds / divisor).toFixed(1))
  };
};

module.exports = {
  DEFAULT_AVATAR_CONFIG,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_TROPHY_SHELF,
  canViewAudience,
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
};
