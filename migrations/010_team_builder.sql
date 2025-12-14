-- Migration 010: Team Builder System
-- Adds tables for FIFA Ultimate Team style progression system

-- ============================================================================
-- Player Teams Table
-- Each student owns one team with 11 player cards (soccer) or 6 (hockey)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Team metadata
  team_name VARCHAR(50) NOT NULL DEFAULT 'My Team',
  formation VARCHAR(10) NOT NULL DEFAULT '4-3-3',
  arena VARCHAR(10) NOT NULL DEFAULT 'soccer' CHECK (arena IN ('soccer', 'hockey')),
  goalkeeper_subject VARCHAR(50), -- Player's chosen GK subject

  -- Resources
  elixir INTEGER NOT NULL DEFAULT 0 CHECK (elixir >= 0 AND elixir <= 500),
  elixir_earned_today INTEGER NOT NULL DEFAULT 0 CHECK (elixir_earned_today >= 0 AND elixir_earned_today <= 200),
  last_elixir_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- League info
  league_tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE' CHECK (league_tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CHAMPION', 'LEGEND')),
  league_points INTEGER NOT NULL DEFAULT 0 CHECK (league_points >= 0),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- Player Cards Table
-- Individual player cards (11 per soccer team, 6 per hockey team)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES player_teams(id) ON DELETE CASCADE,

  -- Position & Subject
  position VARCHAR(10) NOT NULL,
  subject VARCHAR(50) NOT NULL,

  -- Primary stats (0-99)
  accuracy INTEGER NOT NULL DEFAULT 50 CHECK (accuracy >= 0 AND accuracy <= 99),
  speed INTEGER NOT NULL DEFAULT 50 CHECK (speed >= 0 AND speed <= 99),
  consistency INTEGER NOT NULL DEFAULT 50 CHECK (consistency >= 0 AND consistency <= 99),
  difficulty_mastery INTEGER NOT NULL DEFAULT 30 CHECK (difficulty_mastery >= 0 AND difficulty_mastery <= 99),

  -- Calculated overall rating
  overall INTEGER GENERATED ALWAYS AS (
    ROUND(accuracy * 0.4 + speed * 0.3 + consistency * 0.2 + difficulty_mastery * 0.1)::INTEGER
  ) STORED,

  -- Card rarity based on overall
  rarity VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN ROUND(accuracy * 0.4 + speed * 0.3 + consistency * 0.2 + difficulty_mastery * 0.1) >= 90 THEN 'CHAMPION'
      WHEN ROUND(accuracy * 0.4 + speed * 0.3 + consistency * 0.2 + difficulty_mastery * 0.1) >= 80 THEN 'DIAMOND'
      WHEN ROUND(accuracy * 0.4 + speed * 0.3 + consistency * 0.2 + difficulty_mastery * 0.1) >= 60 THEN 'GOLD'
      WHEN ROUND(accuracy * 0.4 + speed * 0.3 + consistency * 0.2 + difficulty_mastery * 0.1) >= 40 THEN 'SILVER'
      ELSE 'BRONZE'
    END
  ) STORED,

  -- Progression
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 14),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One card per position per team
  UNIQUE(team_id, position)
);

-- ============================================================================
-- Elixir Transactions Table
-- Track all elixir earnings and spending
-- ============================================================================

CREATE TABLE IF NOT EXISTS elixir_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES player_teams(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL, -- Positive = earned, negative = spent
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'match_reward',
    'train_player',
    'daily_bonus',
    'weekly_streak_bonus',
    'boost_match',
    'quick_level'
  )),

  -- Optional metadata
  match_id UUID,
  player_card_id UUID REFERENCES player_cards(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- School Leagues Table
-- Per-school league standings
-- ============================================================================

CREATE TABLE IF NOT EXISTS school_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  season_id VARCHAR(20) NOT NULL, -- e.g., '2025-Q1'

  season_start TIMESTAMP WITH TIME ZONE NOT NULL,
  season_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Standings stored as JSONB array
  standings JSONB NOT NULL DEFAULT '[]'::JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(school_id, season_id)
);

-- ============================================================================
-- Global Leagues Table
-- Swiss-wide league standings by tier
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CHAMPION', 'LEGEND')),
  division INTEGER NOT NULL DEFAULT 1 CHECK (division >= 1),
  season_id VARCHAR(20) NOT NULL, -- e.g., '2025-Q1'

  -- Standings stored as JSONB array
  standings JSONB NOT NULL DEFAULT '[]'::JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(tier, division, season_id)
);

-- ============================================================================
-- League Points History Table
-- Track all point changes for players
-- ============================================================================

CREATE TABLE IF NOT EXISTS league_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES player_teams(id) ON DELETE CASCADE,

  points_before INTEGER NOT NULL,
  points_after INTEGER NOT NULL,
  points_change INTEGER NOT NULL,

  match_id UUID,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('match_win', 'match_draw', 'match_loss', 'promotion_bonus', 'season_reset')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Match Results Extension
-- Add team builder fields to existing multiplayer_matches table
-- ============================================================================

-- Add columns to multiplayer_matches if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'multiplayer_matches' AND column_name = 'player1_elixir_earned') THEN
    ALTER TABLE multiplayer_matches ADD COLUMN player1_elixir_earned INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'multiplayer_matches' AND column_name = 'player2_elixir_earned') THEN
    ALTER TABLE multiplayer_matches ADD COLUMN player2_elixir_earned INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'multiplayer_matches' AND column_name = 'player1_xp_distributed') THEN
    ALTER TABLE multiplayer_matches ADD COLUMN player1_xp_distributed JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'multiplayer_matches' AND column_name = 'player2_xp_distributed') THEN
    ALTER TABLE multiplayer_matches ADD COLUMN player2_xp_distributed JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'multiplayer_matches' AND column_name = 'match_type') THEN
    ALTER TABLE multiplayer_matches ADD COLUMN match_type VARCHAR(20) DEFAULT 'ranked';
  END IF;
END $$;

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_player_teams_user ON player_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_team ON player_cards(team_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_subject ON player_cards(subject);
CREATE INDEX IF NOT EXISTS idx_player_cards_overall ON player_cards(overall);
CREATE INDEX IF NOT EXISTS idx_elixir_transactions_team ON elixir_transactions(team_id, created_at);
CREATE INDEX IF NOT EXISTS idx_school_leagues_school ON school_leagues(school_id, season_id);
CREATE INDEX IF NOT EXISTS idx_global_leagues_tier ON global_leagues(tier, division, season_id);
CREATE INDEX IF NOT EXISTS idx_league_points_user ON league_points_history(user_id, created_at);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to reset daily elixir counter
CREATE OR REPLACE FUNCTION reset_daily_elixir()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_elixir_reset::DATE < CURRENT_DATE THEN
    NEW.elixir_earned_today := 0;
    NEW.last_elixir_reset := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-reset daily elixir on update
DROP TRIGGER IF EXISTS trigger_reset_daily_elixir ON player_teams;
CREATE TRIGGER trigger_reset_daily_elixir
  BEFORE UPDATE ON player_teams
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_elixir();

-- Function to update team's updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_team_timestamp ON player_teams;
CREATE TRIGGER trigger_update_team_timestamp
  BEFORE UPDATE ON player_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_team_timestamp();

DROP TRIGGER IF EXISTS trigger_update_card_timestamp ON player_cards;
CREATE TRIGGER trigger_update_card_timestamp
  BEFORE UPDATE ON player_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_team_timestamp();

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION get_xp_for_level(lvl INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE lvl
    WHEN 1 THEN 0
    WHEN 2 THEN 100
    WHEN 3 THEN 250
    WHEN 4 THEN 500
    WHEN 5 THEN 1000
    WHEN 6 THEN 1750
    WHEN 7 THEN 2750
    WHEN 8 THEN 4000
    WHEN 9 THEN 5500
    WHEN 10 THEN 7500
    WHEN 11 THEN 10000
    WHEN 12 THEN 13000
    WHEN 13 THEN 17000
    WHEN 14 THEN 22000
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to level up a card if it has enough XP
CREATE OR REPLACE FUNCTION check_and_level_up_card()
RETURNS TRIGGER AS $$
DECLARE
  next_level_xp INTEGER;
BEGIN
  IF NEW.level < 14 THEN
    next_level_xp := get_xp_for_level(NEW.level + 1);
    IF NEW.xp >= next_level_xp THEN
      NEW.level := NEW.level + 1;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-level up cards
DROP TRIGGER IF EXISTS trigger_level_up_card ON player_cards;
CREATE TRIGGER trigger_level_up_card
  BEFORE UPDATE ON player_cards
  FOR EACH ROW
  WHEN (NEW.xp <> OLD.xp)
  EXECUTE FUNCTION check_and_level_up_card();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE player_teams IS 'Each student owns one team with player cards for each subject';
COMMENT ON TABLE player_cards IS 'Individual player cards representing subjects (11 for soccer, 6 for hockey)';
COMMENT ON TABLE elixir_transactions IS 'Tracks all elixir earnings and spending';
COMMENT ON TABLE school_leagues IS 'Per-school league standings with 3-1-0 point system';
COMMENT ON TABLE global_leagues IS 'Swiss-wide league standings organized by tier';
COMMENT ON TABLE league_points_history IS 'Historical record of all league point changes';
