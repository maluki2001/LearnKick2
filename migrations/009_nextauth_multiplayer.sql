-- Migration: NextAuth.js + Multiplayer Features
-- Run this migration to add authentication and multiplayer support

-- 1. Update users table for NextAuth and multiplayer
-- Remove foreign key constraint to auth.users (Supabase-specific)
-- and add new columns for authentication and multiplayer

-- First, modify the users table to support NextAuth
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_id_fkey;

ALTER TABLE users
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Add new columns for authentication
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP WITH TIME ZONE;

-- Add multiplayer columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS player_grade INTEGER DEFAULT 3 CHECK (player_grade BETWEEN 1 AND 6),
  ADD COLUMN IF NOT EXISTS trophies INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highest_trophies INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'bronze-3',
  ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS win_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS elo INTEGER DEFAULT 1000;

-- Update role check constraint to include superadmin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('superadmin', 'admin', 'teacher', 'parent', 'student'));

-- 2. Create trophy history table
CREATE TABLE IF NOT EXISTS trophy_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trophies_before INTEGER NOT NULL,
  trophies_after INTEGER NOT NULL,
  change INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'win', 'loss', 'season_reset', 'bonus'
  match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create matchmaking queue table
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  player_grade INTEGER NOT NULL,
  school_id UUID REFERENCES schools(id),
  trophies INTEGER NOT NULL DEFAULT 0,
  elo INTEGER NOT NULL DEFAULT 1000,
  language TEXT NOT NULL DEFAULT 'de',
  subject TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled'))
);

-- 4. Create multiplayer matches table
CREATE TABLE IF NOT EXISTS multiplayer_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Players
  player1_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Match configuration
  subject TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de',
  player_grade INTEGER NOT NULL,

  -- Match state
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Match created, waiting for players
    'countdown',    -- Players ready, countdown started
    'active',       -- Game in progress
    'finished',     -- Game completed normally
    'abandoned',    -- Player disconnected
    'cancelled'     -- Match cancelled
  )),

  -- Results
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player1_goals INTEGER DEFAULT 0,
  player2_goals INTEGER DEFAULT 0,
  player1_correct INTEGER DEFAULT 0,
  player2_correct INTEGER DEFAULT 0,
  player1_answered INTEGER DEFAULT 0,
  player2_answered INTEGER DEFAULT 0,

  -- Questions and answers
  questions JSONB DEFAULT '[]',
  player1_answers JSONB DEFAULT '[]',
  player2_answers JSONB DEFAULT '[]',

  -- Trophy changes
  player1_trophy_change INTEGER DEFAULT 0,
  player2_trophy_change INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_trophies ON users(trophies DESC);
CREATE INDEX IF NOT EXISTS idx_users_league ON users(league);
CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo);
CREATE INDEX IF NOT EXISTS idx_users_player_grade ON users(player_grade);

CREATE INDEX IF NOT EXISTS idx_trophy_history_user ON trophy_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_matchmaking_status ON matchmaking_queue(status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_grade ON matchmaking_queue(player_grade);
CREATE INDEX IF NOT EXISTS idx_matchmaking_trophies ON matchmaking_queue(trophies);
CREATE INDEX IF NOT EXISTS idx_matchmaking_school ON matchmaking_queue(school_id);

CREATE INDEX IF NOT EXISTS idx_matches_status ON multiplayer_matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON multiplayer_matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON multiplayer_matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_finished ON multiplayer_matches(finished_at DESC);

-- 6. Create function to update trophy history
CREATE OR REPLACE FUNCTION log_trophy_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trophies IS DISTINCT FROM NEW.trophies THEN
    INSERT INTO trophy_history (user_id, trophies_before, trophies_after, change, reason)
    VALUES (NEW.id, OLD.trophies, NEW.trophies, NEW.trophies - OLD.trophies, 'match');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for trophy changes
DROP TRIGGER IF EXISTS log_trophy_change_trigger ON users;
CREATE TRIGGER log_trophy_change_trigger
  AFTER UPDATE OF trophies ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_trophy_change();

-- 8. Create function to clean up stale matchmaking entries
CREATE OR REPLACE FUNCTION cleanup_stale_matchmaking()
RETURNS void AS $$
BEGIN
  DELETE FROM matchmaking_queue
  WHERE status = 'waiting'
    AND joined_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- 9. Insert default superadmin if not exists
INSERT INTO users (id, email, full_name, role, trophies, league)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@learnkick',
  'LearnKick Platform Owner',
  'superadmin',
  0,
  'staff'
) ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- Comments
COMMENT ON TABLE trophy_history IS 'Historical record of trophy changes for users';
COMMENT ON TABLE matchmaking_queue IS 'Active matchmaking queue for multiplayer matches';
COMMENT ON TABLE multiplayer_matches IS 'Record of all multiplayer matches';
COMMENT ON COLUMN users.trophies IS 'Current trophy count for league ranking';
COMMENT ON COLUMN users.highest_trophies IS 'Highest trophy count ever achieved';
COMMENT ON COLUMN users.league IS 'Current league (bronze-3 to champion)';
COMMENT ON COLUMN users.elo IS 'ELO rating for skill-based matchmaking';
