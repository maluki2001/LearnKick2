-- Migration: Add email linking and verification for player profiles
-- This allows players to link their device-based account to an email for backup/cross-device access

-- Add email column to player_profiles
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Table for storing verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES player_profiles(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(20) NOT NULL DEFAULT 'link', -- 'link' or 'login'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email, code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_player ON email_verification_codes(player_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON email_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_player_profiles_email ON player_profiles(email);

-- Cleanup old verification codes (can be run periodically)
-- DELETE FROM email_verification_codes WHERE expires_at < NOW() OR used_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN player_profiles.email IS 'Optional linked email for account recovery and cross-device access';
COMMENT ON COLUMN player_profiles.email_verified IS 'Whether the email has been verified';
COMMENT ON TABLE email_verification_codes IS 'Temporary 6-digit codes for email verification and login';
COMMENT ON COLUMN email_verification_codes.purpose IS 'link = linking new email, login = accessing from new device';
