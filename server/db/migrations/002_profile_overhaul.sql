ALTER TABLE users ADD COLUMN elo INTEGER DEFAULT 600;
ALTER TABLE users ADD COLUMN avatar_config TEXT DEFAULT '{"bodyShape":"round","eyes":"dots","mouth":"smile","accessory":"none","outfitColor":"blue","frame":"default"}';
ALTER TABLE users ADD COLUMN banner_id TEXT DEFAULT 'clay-sunrise';
ALTER TABLE users ADD COLUMN banner_tint TEXT DEFAULT 'sky';
ALTER TABLE users ADD COLUMN token_skin TEXT DEFAULT 'clay';
ALTER TABLE users ADD COLUMN status_message TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN trophy_shelf TEXT DEFAULT '[]';
ALTER TABLE users ADD COLUMN privacy_settings TEXT DEFAULT '{"showOnlineStatus":"friends_only","showMatchHistory":"friends_only","showStats":"friends_only","showCoinBalance":"nobody","allowFriendRequests":"everyone","allowChallengeInvites":"friends_only"}';
ALTER TABLE users ADD COLUMN notification_prefs TEXT DEFAULT '{"social.friend_request_received":true,"social.friend_accepted":true,"social.friend_online":true,"game.turn_reminder":true,"game.match_result_summary":true,"game.challenge_received":true,"game.tournament_match_ready":true,"rewards.badge_awarded":true,"rewards.quest_completed":true,"rewards.season_reward_claimable":true,"rewards.daily_spin_reminder":true}';
ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'registered';
ALTER TABLE users ADD COLUMN deactivated_at DATETIME;
ALTER TABLE users ADD COLUMN deletion_scheduled_at DATETIME;

ALTER TABLE match_history ADD COLUMN winner TEXT;
ALTER TABLE match_history ADD COLUMN players_json TEXT DEFAULT '[]';
ALTER TABLE match_history ADD COLUMN duration_seconds INTEGER DEFAULT 0;
ALTER TABLE match_history ADD COLUMN game_mode TEXT DEFAULT 'Classic';
ALTER TABLE match_history ADD COLUMN token_stats_json TEXT DEFAULT '{}';
ALTER TABLE match_history ADD COLUMN captures_json TEXT DEFAULT '[]';
ALTER TABLE match_history ADD COLUMN dice_rolls_json TEXT DEFAULT '{}';
ALTER TABLE match_history ADD COLUMN result_json TEXT DEFAULT '{}';
ALTER TABLE match_history ADD COLUMN elo_delta INTEGER DEFAULT 0;

UPDATE match_history
SET duration_seconds = COALESCE(duration_seconds, duration, 0)
WHERE duration_seconds IS NULL OR duration_seconds = 0;

UPDATE match_history
SET winner = COALESCE(winner, winner_uid)
WHERE winner IS NULL AND winner_uid IS NOT NULL;

CREATE TABLE IF NOT EXISTS badge_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER DEFAULT 0,
  unlock_text TEXT NOT NULL,
  earn_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uid TEXT NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at DATETIME,
  progress INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  UNIQUE(user_uid, badge_key)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  device_info TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_uid TEXT NOT NULL,
  blocked_uid TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_uid, blocked_uid)
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uid TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
