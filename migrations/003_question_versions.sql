-- Migration 003: Question Version Control
-- Track all changes to questions for audit trail

CREATE TABLE IF NOT EXISTS question_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- Change tracking
  question_data JSONB NOT NULL, -- Full question snapshot
  changes_summary TEXT,
  change_reason TEXT,

  -- Who and when
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique version numbers per question
  UNIQUE(question_id, version_number)
);

-- Index for version history queries
CREATE INDEX idx_question_versions_question_id
  ON question_versions(question_id, version_number DESC);

-- Auto-create version on question update
CREATE OR REPLACE FUNCTION save_question_version()
RETURNS TRIGGER AS $$
DECLARE
  latest_version INTEGER;
BEGIN
  -- Get latest version number
  SELECT COALESCE(MAX(version_number), 0) INTO latest_version
  FROM question_versions
  WHERE question_id = NEW.id;

  -- Save new version
  INSERT INTO question_versions (
    question_id, version_number, question_data,
    changed_by, changes_summary
  ) VALUES (
    NEW.id,
    latest_version + 1,
    row_to_json(NEW),
    NEW.reviewed_by,
    'Auto-saved version'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_save_question_version
  AFTER UPDATE ON questions
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION save_question_version();

COMMENT ON TABLE question_versions IS
  'Complete version history for every question change';
