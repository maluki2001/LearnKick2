-- Migration 006: Generation Progress Tracking
-- Real-time tracking of 8,000-question generation goal

CREATE TABLE IF NOT EXISTS generation_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Target configuration
  language TEXT NOT NULL CHECK (language IN ('de', 'en', 'fr')),
  target_total INTEGER NOT NULL,

  -- Progress counters
  generated_total INTEGER DEFAULT 0,
  qc_passed INTEGER DEFAULT 0,
  qc_failed INTEGER DEFAULT 0,
  flagged INTEGER DEFAULT 0,
  approved INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,

  -- Generation rate
  questions_per_hour DECIMAL(10,2),
  estimated_completion TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),

  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(language)
);

-- Initialize progress for all languages
INSERT INTO generation_progress (language, target_total) VALUES
  ('de', 4000),
  ('en', 2000),
  ('fr', 2000)
ON CONFLICT (language) DO NOTHING;

-- View for overall progress
CREATE OR REPLACE VIEW generation_progress_summary AS
SELECT
  SUM(target_total) as total_target,
  SUM(generated_total) as total_generated,
  SUM(approved) as total_approved,
  ROUND(
    (SUM(approved)::DECIMAL / SUM(target_total)) * 100, 2
  ) as completion_percentage
FROM generation_progress;

COMMENT ON TABLE generation_progress IS
  'Tracks progress toward 8,000-question goal (4000 DE, 2000 EN, 2000 FR)';
