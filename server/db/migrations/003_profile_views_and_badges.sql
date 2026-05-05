CREATE VIEW IF NOT EXISTS user_stats_view AS
SELECT
  json_extract(player.value, '$.uid') AS user_uid,
  COUNT(DISTINCT m.id) AS total_matches_played,
  SUM(CASE WHEN json_extract(player.value, '$.result') = 'win' THEN 1 ELSE 0 END) AS total_wins,
  SUM(COALESCE(json_extract(player.value, '$.tokensHome'), 0)) AS total_tokens_sent_home,
  SUM(COALESCE(json_extract(player.value, '$.capturesMade'), 0)) AS total_tokens_captured,
  SUM(COALESCE(json_extract(player.value, '$.timesCaptured'), 0)) AS total_times_captured,
  SUM(COALESCE(json_extract(player.value, '$.playTimeSeconds'), m.duration_seconds, 0)) AS total_play_time_seconds
FROM match_history m
JOIN json_each(COALESCE(m.players_json, '[]')) AS player
GROUP BY json_extract(player.value, '$.uid');

INSERT OR IGNORE INTO badge_definitions
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
  ('legend_core', 'Legend Core', 'Reach 2500 ELO.', '👑', 'elo', 2500, 'Reach 2500 ELO', 0);
