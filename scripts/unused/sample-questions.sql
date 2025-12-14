-- Sample questions for LearnKick
-- Insert some basic questions for testing

-- Get the demo school ID
DO $$
DECLARE
  demo_school_id UUID;
  demo_user_id UUID;
BEGIN
  -- Get demo school and user IDs
  SELECT id INTO demo_school_id FROM schools WHERE code = 'DEMO001';
  SELECT id INTO demo_user_id FROM users WHERE email = 'admin@demo.com';

  -- Insert sample math questions for Grade 2
  INSERT INTO questions (school_id, created_by, type, subject, grade, difficulty, language, question, answers, correct_index, explanation, tags, time_limit) VALUES
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 2, 1, 'en', 'What is 5 + 3?', ARRAY['6', '7', '8', '9'], 2, '5 + 3 = 8', ARRAY['addition', 'basic'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 2, 1, 'en', 'What is 10 - 4?', ARRAY['4', '5', '6', '7'], 2, '10 - 4 = 6', ARRAY['subtraction', 'basic'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 2, 1, 'en', 'What is 2 × 3?', ARRAY['5', '6', '7', '8'], 1, '2 × 3 = 6', ARRAY['multiplication', 'basic'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 2, 2, 'en', 'What is 12 ÷ 3?', ARRAY['2', '3', '4', '5'], 2, '12 ÷ 3 = 4', ARRAY['division', 'intermediate'], 15000);

  -- Insert sample math questions for Grade 3
  INSERT INTO questions (school_id, created_by, type, subject, grade, difficulty, language, question, answers, correct_index, explanation, tags, time_limit) VALUES
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 3, 2, 'en', 'What is 15 + 27?', ARRAY['40', '41', '42', '43'], 2, '15 + 27 = 42', ARRAY['addition', 'intermediate'], 20000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 3, 2, 'en', 'What is 50 - 18?', ARRAY['30', '31', '32', '33'], 2, '50 - 18 = 32', ARRAY['subtraction', 'intermediate'], 20000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'math', 3, 2, 'en', 'What is 7 × 8?', ARRAY['54', '55', '56', '57'], 2, '7 × 8 = 56', ARRAY['multiplication', 'intermediate'], 20000);

  -- Insert general knowledge questions
  INSERT INTO questions (school_id, created_by, type, subject, grade, difficulty, language, question, answers, correct_index, explanation, tags, time_limit) VALUES
  (demo_school_id, demo_user_id, 'multiple-choice', 'general-knowledge', 2, 1, 'en', 'What color is the sky on a clear day?', ARRAY['Red', 'Blue', 'Green', 'Yellow'], 1, 'The sky appears blue because of how sunlight scatters in the atmosphere.', ARRAY['science', 'basic'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'general-knowledge', 2, 1, 'en', 'How many days are in a week?', ARRAY['5', '6', '7', '8'], 2, 'There are 7 days in a week.', ARRAY['time', 'basic'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'general-knowledge', 3, 2, 'en', 'What is the capital of France?', ARRAY['London', 'Berlin', 'Paris', 'Rome'], 2, 'Paris is the capital city of France.', ARRAY['geography', 'intermediate'], 20000);

  -- Insert language questions
  INSERT INTO questions (school_id, created_by, type, subject, grade, difficulty, language, question, answers, correct_index, explanation, tags, time_limit) VALUES
  (demo_school_id, demo_user_id, 'multiple-choice', 'language', 2, 1, 'en', 'Which word is a noun?', ARRAY['Run', 'Dog', 'Happy', 'Quickly'], 1, 'A noun is a person, place, or thing. "Dog" is a thing.', ARRAY['grammar', 'nouns'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'language', 2, 1, 'en', 'What is the opposite of "hot"?', ARRAY['Warm', 'Cold', 'Cool', 'Freezing'], 1, 'The opposite of hot is cold.', ARRAY['vocabulary', 'antonyms'], 15000),
  (demo_school_id, demo_user_id, 'multiple-choice', 'language', 3, 2, 'en', 'Which sentence is correct?', ARRAY['She go to school', 'She goes to school', 'She going to school', 'She gone to school'], 1, 'The correct form is "She goes to school" using present tense.', ARRAY['grammar', 'verbs'], 20000);

  RAISE NOTICE 'Successfully inserted % sample questions!', (SELECT COUNT(*) FROM questions);
END $$;
