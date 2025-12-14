-- Migration 002: Question Performance Tracking
-- Track real-world question metrics for ELO calibration

CREATE TABLE IF NOT EXISTS question_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,

  -- Performance metrics
  times_asked INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,

  -- Calculated metrics
  accuracy_rate DECIMAL(5,2), -- 0.00 to 100.00
  difficulty_actual INTEGER, -- Calculated from performance

  -- Grade-level breakdown
  performance_by_grade JSONB DEFAULT '{}',

  -- Timestamps
  first_asked_at TIMESTAMP WITH TIME ZONE,
  last_asked_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast question lookups
CREATE INDEX idx_question_performance_question_id
  ON question_performance(question_id);

-- Index for finding poorly performing questions
CREATE INDEX idx_question_performance_accuracy
  ON question_performance(accuracy_rate);

-- Auto-update accuracy rate on insert/update
CREATE OR REPLACE FUNCTION update_question_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.times_asked > 0 THEN
    NEW.accuracy_rate = (NEW.times_correct::DECIMAL / NEW.times_asked) * 100;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_accuracy
  BEFORE INSERT OR UPDATE ON question_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_question_accuracy();

-- Comments
COMMENT ON TABLE question_performance IS
  'Tracks how questions perform in real games for ELO calibration';
COMMENT ON COLUMN question_performance.accuracy_rate IS
  'Percentage of students who answered correctly (auto-calculated)';
