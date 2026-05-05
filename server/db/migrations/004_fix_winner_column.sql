-- Add winner column (string like 'red') and migrate data
-- ALTER TABLE match_history ADD COLUMN winner TEXT; -- Already added in 002_profile_overhaul.sql

-- Copy winner_uid -> winner color from players_json
UPDATE match_history
SET winner = (
  SELECT json_extract(value, '$.color')
  FROM json_each(players_json)
  WHERE json_extract(value, '$.uid') = winner_uid
)
WHERE winner_uid IS NOT NULL AND winner IS NULL;

CREATE INDEX IF NOT EXISTS idx_match_history_winner ON match_history(winner);
CREATE INDEX IF NOT EXISTS idx_match_history_winner_uid ON match_history(winner_uid);
CREATE INDEX IF NOT EXISTS idx_match_history_played_at ON match_history(played_at);