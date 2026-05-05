CREATE TABLE IF NOT EXISTS shop_items (
  id SERIAL PRIMARY KEY,
  item_key TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  item_key TEXT NOT NULL,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uid, item_key)
);

CREATE TABLE IF NOT EXISTS daily_quests (
  id SERIAL PRIMARY KEY,
  quest_key TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  reward_coins INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_daily_progress (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  date DATE NOT NULL,
  quest_key TEXT NOT NULL,
  current_value INTEGER DEFAULT 0,
  is_claimed INTEGER DEFAULT 0,
  UNIQUE(user_uid, date, quest_key)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP;

INSERT INTO shop_items (item_key, type, name, price, rarity)
VALUES
  ('dice_neon', 'dice_skin', 'Neon Glow Dice', 500, 'rare'),
  ('dice_gold', 'dice_skin', 'Solid Gold Dice', 2500, 'legendary'),
  ('dice_elemental', 'dice_skin', 'Elemental Flux Dice', 5000, 'mythic'),
  ('token_cyber', 'token_skin', 'Cyber Punk Tokens', 1000, 'rare'),
  ('token_hologram', 'token_skin', 'Hologram Tokens', 3000, 'legendary'),
  ('board_space', 'board_theme', 'Deep Space Board', 2000, 'epic')
ON CONFLICT (item_key) DO NOTHING;

INSERT INTO daily_quests (quest_key, description, target_value, reward_coins)
VALUES
  ('play_3_matches', 'Play 3 Matches', 3, 100),
  ('capture_5_tokens', 'Capture 5 Tokens', 5, 250),
  ('win_1_match', 'Win 1 Match', 1, 150)
ON CONFLICT (quest_key) DO NOTHING;
