-- Sample data for LearnKick demo
-- Execute this after running the main schema

-- Insert a demo school
INSERT INTO schools (id, name, code, subscription_plan, settings) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Elementary School', 
  'DEMO123', 
  'free',
  '{
    "allow_parent_signup": true,
    "require_approval": false,
    "game_time_limits": true
  }'
) ON CONFLICT (id) DO NOTHING;

-- Note: You'll need to create users through the Supabase auth system first
-- Then you can add them to the users table with this sample data

-- Sample questions for different subjects and grades
INSERT INTO questions (school_id, created_by, type, subject, grade, difficulty, language, question, statement, answers, correct_index, explanation, time_limit) VALUES 

-- Math Grade 3
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'math', 3, 2, 'en', 
 'What is 5 + 3?', 'Calculate the sum', ARRAY['6', '7', '8', '9'], 2, 'When adding 5 + 3, count forward from 5: 6, 7, 8', 15000),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'math', 3, 2, 'en',
 'What is 12 - 4?', 'Calculate the difference', ARRAY['6', '7', '8', '9'], 2, 'When subtracting 4 from 12, count backwards: 11, 10, 9, 8', 15000),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'math', 3, 3, 'en',
 'What is 6 × 4?', 'Calculate the product', ARRAY['20', '22', '24', '26'], 2, '6 × 4 means 6 groups of 4: 4+4+4+4+4+4 = 24', 20000),

-- Geography Grade 4
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'geography', 4, 2, 'en',
 'Which is the largest continent?', 'Identify the biggest continent by area', ARRAY['Africa', 'Asia', 'Europe', 'North America'], 1, 'Asia is the largest continent covering about 30% of Earth''s land area', 20000),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'geography', 4, 3, 'en',
 'What is the capital of France?', 'Name the capital city', ARRAY['London', 'Berlin', 'Paris', 'Madrid'], 2, 'Paris has been the capital of France since 508 AD', 15000),

-- Language Grade 2
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'language', 2, 1, 'en',
 'Which word rhymes with "cat"?', 'Find the rhyming word', ARRAY['dog', 'hat', 'car', 'big'], 1, 'Words that rhyme have the same ending sound. "Cat" and "hat" both end with "-at"', 15000),

-- General Knowledge Grade 5
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'general-knowledge', 5, 3, 'en',
 'How many legs does a spider have?', 'Count the spider legs', ARRAY['6', '8', '10', '12'], 1, 'All spiders are arachnids and have exactly 8 legs', 15000),

-- German Math questions
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'math', 3, 2, 'de',
 'Was ist 7 + 5?', 'Berechne die Summe', ARRAY['10', '11', '12', '13'], 2, 'Wenn du 7 + 5 rechnest, zähle von 7 weiter: 8, 9, 10, 11, 12', 15000),

-- French Geography
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'multiple-choice', 'geography', 4, 2, 'fr',
 'Quelle est la capitale de l''Allemagne?', 'Nomme la capitale', ARRAY['Munich', 'Hambourg', 'Berlin', 'Cologne'], 2, 'Berlin est la capitale de l''Allemagne depuis la réunification en 1990', 15000);

-- Insert sample game sessions (you'll need real user IDs)
-- These are examples - replace with actual user IDs after creating users
/*
INSERT INTO game_sessions (school_id, student_id, subject, grade, language, questions_answered, correct_answers, total_score, accuracy, duration_seconds, completed_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'math', 3, 'en', 10, 8, 800, 80.00, 120, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'geography', 4, 'en', 8, 6, 600, 75.00, 95, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'math', 3, 'en', 12, 11, 1100, 91.67, 180, NOW() - INTERVAL '3 hours');
*/

-- Display summary of inserted data
SELECT 
  'Schools' as table_name, 
  COUNT(*) as count 
FROM schools
WHERE name = 'Demo Elementary School'

UNION ALL

SELECT 
  'Questions' as table_name, 
  COUNT(*) as count 
FROM questions
WHERE school_id = '550e8400-e29b-41d4-a716-446655440000'

ORDER BY table_name;