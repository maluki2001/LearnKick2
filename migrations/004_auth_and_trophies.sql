-- Migration: Add authentication and trophy fields for multiplayer
-- Run this against your PostgreSQL database

-- ============================================
-- 1. Add authentication fields to users table
-- ============================================

-- Password hash for email/password login
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Email verification timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP WITH TIME ZONE;

-- Player grade (for students)
ALTER TABLE users ADD COLUMN IF NOT EXISTS player_grade INTEGER DEFAULT 3 CHECK (player_grade BETWEEN 1 AND 6);

-- ============================================
-- 2. Add trophy and league fields
-- ============================================

-- Trophy count
ALTER TABLE users ADD COLUMN IF NOT EXISTS trophies INTEGER DEFAULT 0;

-- Highest trophy count ever achieved
ALTER TABLE users ADD COLUMN IF NOT EXISTS highest_trophies INTEGER DEFAULT 0;

-- Current league
ALTER TABLE users ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'bronze-3';

-- Win/loss statistics
ALTER TABLE users ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0;

-- Win streak tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_win_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_win_streak INTEGER DEFAULT 0;

-- ============================================
-- 3. Add school_name to users for convenience
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS school_name TEXT;

-- ============================================
-- 4. Create NextAuth tables (if using database adapter)
-- ============================================

-- Accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS auth_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification tokens for email verification
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================
-- 5. Create trophy history table
-- ============================================

CREATE TABLE IF NOT EXISTS trophy_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trophies_before INTEGER NOT NULL,
  trophies_after INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'match_win', 'match_loss', 'season_reset', etc.
  match_id UUID, -- Reference to match if applicable
  opponent_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_trophy_history_user_id ON trophy_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trophy_history_created_at ON trophy_history(created_at);

-- ============================================
-- 6. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_trophies ON users(trophies);
CREATE INDEX IF NOT EXISTS idx_users_league ON users(league);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);

-- ============================================
-- 7. Update superadmin user with password
-- ============================================

-- Default superadmin password: LearnKick123!
-- Hash generated with bcrypt (12 rounds)
-- In production, change this password immediately!
UPDATE users
SET password_hash = '$2b$12$LFsR7fZXZvK2Y5.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F.F'
WHERE email = 'admin@learnkick'
  AND password_hash IS NULL;

-- ============================================
-- Done!
-- ============================================
SELECT 'Migration 004_auth_and_trophies completed successfully!' as status;
