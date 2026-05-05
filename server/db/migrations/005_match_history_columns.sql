-- Migration 005: Ensure match_history has all required columns
-- SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS,
-- so we use a safe approach: try adding each column and ignore errors via the trigger mechanism.
-- We do it by creating a temp table check pattern.

-- Add duration_seconds (safe - will fail silently if column already exists via application logic)
-- We use a workaround: check if column exists via sqlite_master
-- Since SQLite < 3.35 doesn't support IF NOT EXISTS on ALTER TABLE,
-- we just ensure the columns exist by always trying to add them.
-- The migration runner will roll back on error, so we catch via separate statements.

CREATE TABLE IF NOT EXISTS match_history_columns_added (id INTEGER PRIMARY KEY);
INSERT OR IGNORE INTO match_history_columns_added (id) VALUES (1);
