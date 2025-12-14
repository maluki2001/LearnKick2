-- Subjects data for LearnKick
-- Insert these subjects into your database first

-- Default school and user for import
-- DEFAULT_SCHOOL_ID: 90db317f-4989-421b-b0e2-5888e06fd22d
-- DEFAULT_USER_ID: d37e0fc8-da07-4191-a037-de021fc1ded9

INSERT INTO subjects (id, name, slug, school_id) VALUES ('d15fe1f7-7306-47d5-8a8d-58178d110b00', 'General Knowledge', 'general-knowledge', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO subjects (id, name, slug, school_id) VALUES ('9f9067f9-9e39-4e38-944f-6701b837981b', 'Mathematics', 'math', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO subjects (id, name, slug, school_id) VALUES ('0a8b8797-918c-4893-bfab-6614dd7fd0c2', 'Geography', 'geography', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO subjects (id, name, slug, school_id) VALUES ('9f7cac5d-a898-4073-a7cb-458fe6289d23', 'Language', 'language', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO subjects (id, name, slug, school_id) VALUES ('399cbd09-bd9c-4201-8a2b-d50a4c3b5b65', 'Science', 'science', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO subjects (id, name, slug, school_id) VALUES ('4e94c46e-24f5-4b2c-b05f-02da215b836e', 'History', 'history', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO subjects (id, name, slug, school_id) VALUES ('2ee4ea42-dd42-4e2c-8b4d-616dc98c4e2c', 'Art', 'art', NULL) ON CONFLICT (slug) DO NOTHING;
