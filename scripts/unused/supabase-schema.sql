-- LearnKick Database Schema for Supabase
-- Execute these commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subjects table for dynamic subject management
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for internal reference (math, geography, etc.)
  icon TEXT DEFAULT '📚', -- emoji or icon class
  color TEXT DEFAULT '#3b82f6', -- hex color for UI
  description TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL for system-wide subjects
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (name, slug, icon, color, description, school_id) VALUES
('General Knowledge', 'general-knowledge', '🧠', '#6366f1', 'General knowledge and trivia questions', NULL),
('Mathematics', 'math', '🔢', '#10b981', 'Math, algebra, geometry, and arithmetic', NULL),
('Geography', 'geography', '🌍', '#f59e0b', 'World geography, countries, and landmarks', NULL),
('Language', 'language', '📖', '#ec4899', 'Language arts, grammar, and vocabulary', NULL),
('Science', 'science', '🔬', '#06b6d4', 'Biology, chemistry, physics, and general science', NULL),
('History', 'history', '📜', '#8b5cf6', 'World history, events, and civilizations', NULL),
('Art', 'art', '🎨', '#f97316', 'Visual arts, music, and creative subjects', NULL);

-- Schools table
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  admin_user_id UUID,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  max_students INTEGER DEFAULT 50,
  max_teachers INTEGER DEFAULT 3,
  settings JSONB DEFAULT '{
    "allow_parent_signup": true,
    "require_approval": false,
    "game_time_limits": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent', 'student')),
  school_id UUID REFERENCES schools(id),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  
  -- Question content
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'number-input', 'image-question')),
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  subject TEXT NOT NULL, -- Keep for backward compatibility and easier queries
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  language TEXT NOT NULL CHECK (language IN ('en', 'de', 'fr')),
  
  -- Question data
  question TEXT,
  statement TEXT,
  answers TEXT[], -- Array for multiple choice answers
  correct_index INTEGER,
  correct_answer TEXT, -- For number input or text answers
  explanation TEXT,
  unit TEXT,
  image_url TEXT,
  tags TEXT[],
  
  -- Metadata
  time_limit INTEGER DEFAULT 15000, -- milliseconds
  lehrplan21_topic TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  student_id UUID REFERENCES users(id) NOT NULL,
  
  -- Game configuration
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  language TEXT NOT NULL,
  game_mode TEXT DEFAULT 'family' CHECK (game_mode IN ('family', 'school')),
  
  -- Session data
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Question details (for analytics)
  question_results JSONB DEFAULT '[]', -- Array of question results
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School invitations table
CREATE TABLE school_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  invited_by UUID REFERENCES users(id) NOT NULL,
  
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'parent')),
  code TEXT UNIQUE NOT NULL,
  
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student-Parent relationships
CREATE TABLE student_parents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES users(id) NOT NULL,
  parent_id UUID REFERENCES users(id) NOT NULL,
  school_id UUID REFERENCES schools(id) NOT NULL,
  relationship TEXT DEFAULT 'parent', -- parent, guardian, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, parent_id)
);

-- Indexes for performance
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_school_id ON questions(school_id);
CREATE INDEX idx_questions_subject_grade ON questions(subject, grade);
CREATE INDEX idx_questions_language ON questions(language);
CREATE INDEX idx_game_sessions_student_id ON game_sessions(student_id);
CREATE INDEX idx_game_sessions_school_id ON game_sessions(school_id);
CREATE INDEX idx_game_sessions_completed_at ON game_sessions(completed_at);
CREATE INDEX idx_school_invites_code ON school_invites(code);
CREATE INDEX idx_school_invites_email ON school_invites(email);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Users can view their own school" ON schools
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE school_id = schools.id
    )
  );

CREATE POLICY "School admins can update their school" ON schools
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE school_id = schools.id AND role = 'admin'
    )
  );

-- Subjects policies
CREATE POLICY "Users can view all subjects" ON subjects
  FOR SELECT USING (
    school_id IS NULL OR 
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'teacher')
      AND (subjects.school_id IS NULL OR subjects.school_id = users.school_id)
    )
  );

-- Users policies
CREATE POLICY "Users can view users in their school" ON users
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins and teachers can view all users in their school" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE school_id = users.school_id 
      AND role IN ('admin', 'teacher')
    )
  );

-- Questions policies
CREATE POLICY "Users can view questions in their school" ON questions
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can manage questions in their school" ON questions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE school_id = questions.school_id 
      AND role IN ('admin', 'teacher')
    )
  );

-- Game sessions policies
CREATE POLICY "Users can view sessions in their school" ON game_sessions
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own sessions" ON game_sessions
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

-- School invites policies
CREATE POLICY "Admins and teachers can manage invites" ON school_invites
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE school_id = school_invites.school_id 
      AND role IN ('admin', 'teacher')
    )
  );

-- Functions

-- Function to automatically set school admin
CREATE OR REPLACE FUNCTION set_school_admin()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE schools 
  SET admin_user_id = NEW.id 
  WHERE id = NEW.school_id AND admin_user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set school admin
CREATE TRIGGER set_school_admin_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION set_school_admin();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial data (optional)
-- You can insert sample data here if needed

COMMENT ON TABLE schools IS 'Schools/organizations using LearnKick';
COMMENT ON TABLE users IS 'Extended user profiles for all user types';
COMMENT ON TABLE questions IS 'Educational questions organized by school';
COMMENT ON TABLE game_sessions IS 'Student game session data and analytics';
COMMENT ON TABLE school_invites IS 'Invitation system for schools';
COMMENT ON TABLE student_parents IS 'Relationships between students and parents';