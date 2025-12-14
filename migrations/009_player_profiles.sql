-- Migration: Create player_profiles table for device-based anonymous player storage
-- This allows players to persist their profile without requiring login

CREATE TABLE IF NOT EXISTS player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL UNIQUE,

  -- Player info
  name VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL DEFAULT 3,
  elo INTEGER NOT NULL DEFAULT 1000,
  game_mode VARCHAR(20), -- 'school' or 'home'

  -- Stats
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_incorrect_answers INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  favorite_subject VARCHAR(50) DEFAULT 'math',
  total_wins INTEGER NOT NULL DEFAULT 0,

  -- Preferences
  ui_language VARCHAR(10) NOT NULL DEFAULT 'de',
  question_language VARCHAR(10) NOT NULL DEFAULT 'de',
  preferred_arena VARCHAR(20) NOT NULL DEFAULT 'soccer',

  -- Timestamps
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for fast device ID lookups
CREATE INDEX IF NOT EXISTS idx_player_profiles_device_id ON player_profiles(device_id);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_player_profiles_elo ON player_profiles(elo DESC);
CREATE INDEX IF NOT EXISTS idx_player_profiles_total_wins ON player_profiles(total_wins DESC);

-- Comment
COMMENT ON TABLE player_profiles IS 'Device-based player profiles for anonymous/guest users';
COMMENT ON COLUMN player_profiles.device_id IS 'Unique device identifier generated on first visit';
