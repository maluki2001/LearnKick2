-- Migration 004: QC Validation Log
-- Track all QC agent validation attempts

CREATE TABLE IF NOT EXISTS question_validation_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,

  -- Validation details
  qc_agent_id TEXT NOT NULL, -- 'qc-de', 'qc-en', 'qc-fr'
  validation_status TEXT NOT NULL
    CHECK (validation_status IN ('PASS', 'FAIL', 'FLAG_FOR_REVIEW')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),

  -- Validation results
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  full_report JSONB,

  -- Timing
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validation_duration_ms INTEGER
);

-- Indexes
CREATE INDEX idx_validation_log_question_id
  ON question_validation_log(question_id, validated_at DESC);

CREATE INDEX idx_validation_log_status
  ON question_validation_log(validation_status);

CREATE INDEX idx_validation_log_agent
  ON question_validation_log(qc_agent_id);

-- View for latest validation per question
CREATE OR REPLACE VIEW latest_question_validations AS
SELECT DISTINCT ON (question_id)
  *
FROM question_validation_log
ORDER BY question_id, validated_at DESC;

COMMENT ON TABLE question_validation_log IS
  'Complete audit log of all QC agent validations';
COMMENT ON VIEW latest_question_validations IS
  'Most recent validation status for each question';
