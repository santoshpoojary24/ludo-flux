-- Postgres Schema Migration from SQLite

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL,
  coins INTEGER DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  elo INTEGER DEFAULT 600,
  avatar_config TEXT DEFAULT '{"bodyShape":"round","eyes":"dots","mouth":"smile","accessory":"none","outfitColor":"blue","frame":"default"}',
  banner_id TEXT DEFAULT 'clay-sunrise',
  banner_tint TEXT DEFAULT 'sky',
  token_skin TEXT DEFAULT 'clay',
  status_message TEXT DEFAULT '',
  trophy_shelf TEXT DEFAULT '[]',
  privacy_settings TEXT DEFAULT '{"showOnlineStatus":"friends_only","showMatchHistory":"friends_only","showStats":"friends_only","showCoinBalance":"nobody","allowFriendRequests":"everyone","allowChallengeInvites":"friends_only"}',
  notification_prefs TEXT DEFAULT '{"social.friend_request_received":true,"social.friend_accepted":true,"social.friend_online":true,"game.turn_reminder":true,"game.match_result_summary":true,"game.challenge_received":true,"game.tournament_match_ready":true,"rewards.badge_awarded":true,"rewards.quest_completed":true,"rewards.season_reward_claimable":true,"rewards.daily_spin_reminder":true}',
  account_type TEXT DEFAULT 'registered',
  deactivated_at TIMESTAMP,
  deletion_scheduled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_history (
  id SERIAL PRIMARY KEY,
  room_code TEXT NOT NULL,
  winner_uid TEXT,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  winner TEXT,
  players_json TEXT DEFAULT '[]',
  duration_seconds INTEGER DEFAULT 0,
  game_mode TEXT DEFAULT 'Classic',
  token_stats_json TEXT DEFAULT '{}',
  captures_json TEXT DEFAULT '[]',
  dice_rolls_json TEXT DEFAULT '{}',
  result_json TEXT DEFAULT '{}',
  elo_delta INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_match_history_winner ON match_history(winner);
CREATE INDEX IF NOT EXISTS idx_match_history_winner_uid ON match_history(winner_uid);
CREATE INDEX IF NOT EXISTS idx_match_history_played_at ON match_history(played_at);

CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  friend_uid TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uid, friend_uid)
);

CREATE TABLE IF NOT EXISTS activity_feed (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badge_definitions (
  id SERIAL PRIMARY KEY,
  badge_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER DEFAULT 0,
  unlock_text TEXT NOT NULL,
  earn_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMP,
  progress INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  UNIQUE(user_uid, badge_key)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  device_info TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_uid TEXT NOT NULL,
  blocked_uid TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_uid, blocked_uid)
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW user_stats_view AS
SELECT
  player.value->>'uid' AS user_uid,
  COUNT(DISTINCT m.id) AS total_matches_played,
  SUM(CASE WHEN (player.value->>'result') = 'win' THEN 1 ELSE 0 END) AS total_wins,
  SUM(COALESCE(CAST(player.value->>'tokensHome' AS INTEGER), 0)) AS total_tokens_sent_home,
  SUM(COALESCE(CAST(player.value->>'capturesMade' AS INTEGER), 0)) AS total_tokens_captured,
  SUM(COALESCE(CAST(player.value->>'timesCaptured' AS INTEGER), 0)) AS total_times_captured,
  SUM(COALESCE(CAST(player.value->>'playTimeSeconds' AS INTEGER), m.duration_seconds, 0)) AS total_play_time_seconds
FROM match_history m
CROSS JOIN json_array_elements(
  CASE 
    WHEN m.players_json IS NULL OR m.players_json = '' THEN '[]'::json 
    ELSE CAST(m.players_json AS json) 
  END
) AS player
GROUP BY player.value->>'uid';

INSERT INTO badge_definitions
  (badge_key, name, description, icon, condition_type, condition_value, unlock_text, earn_count)
VALUES
  ('first_steps', 'First Steps', 'Play your first match.', '🎯', 'matches_played', 1, 'Play 1 match', 0),
  ('road_warrior', 'Road Warrior', 'Play 25 lifetime matches.', '🛣️', 'matches_played', 25, 'Play 25 matches', 0),
  ('veteran_flux', 'Veteran Flux', 'Play 50 lifetime matches.', '🏁', 'matches_played', 50, 'Play 50 matches', 0),
  ('token_hunter', 'Token Hunter', 'Capture 10 opponent tokens.', '🪤', 'tokens_captured', 10, 'Capture 10 tokens', 0),
  ('castle_crasher', 'Castle Crasher', 'Capture 25 opponent tokens.', '🏰', 'tokens_captured', 25, 'Capture 25 tokens', 0),
  ('hat_trick_hero', 'Hat-trick Hero', 'Win 3 matches in a row.', '🎩', 'win_streak', 3, 'Reach a 3-win streak', 0),
  ('streak_lord', 'Streak Lord', 'Win 5 matches in a row.', '⚡', 'win_streak', 5, 'Reach a 5-win streak', 0),
  ('lucky_spinner', 'Lucky Spinner', 'Spin the daily wheel 5 times.', '🎡', 'spin_count', 5, 'Spin the wheel 5 times', 0),
  ('elo_climber', 'ELO Climber', 'Reach 1000 ELO.', '📈', 'elo', 1000, 'Reach 1000 ELO', 0),
  ('legend_core', 'Legend Core', 'Reach 2500 ELO.', '👑', 'elo', 2500, 'Reach 2500 ELO', 0)
ON CONFLICT (badge_key) DO NOTHING;
