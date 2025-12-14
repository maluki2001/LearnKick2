const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkProblematicQuestions() {
  console.log('Checking problematic English science questions...\n');

  // Check for questions with empty correct_answer
  console.log('1. Questions with empty correct_answer:');
  const emptyCorrectAnswer = await pool.query(`
    SELECT id, question, correct_answer, answers, grade
    FROM questions
    WHERE language = 'en' AND subject = 'science'
    AND (correct_answer IS NULL OR correct_answer = '')
    LIMIT 10
  `);
  console.log(`Found ${emptyCorrectAnswer.rows.length} questions\n`);
  emptyCorrectAnswer.rows.forEach(q => {
    console.log(`ID: ${q.id}`);
    console.log(`Question: ${q.question}`);
    console.log(`Correct Answer: "${q.correct_answer}"`);
    console.log(`Answers: ${JSON.stringify(q.answers)}`);
    console.log('---');
  });

  // Check for questions with null/invalid answers array
  console.log('\n2. Questions with null/invalid answers array:');
  const nullAnswers = await pool.query(`
    SELECT id, question, correct_answer, answers, grade
    FROM questions
    WHERE language = 'en' AND subject = 'science'
    AND answers IS NULL
    LIMIT 10
  `);
  console.log(`Found ${nullAnswers.rows.length} questions\n`);
  nullAnswers.rows.forEach(q => {
    console.log(`ID: ${q.id}`);
    console.log(`Question: ${q.question}`);
    console.log(`Correct Answer: ${q.correct_answer}`);
    console.log(`Answers: ${JSON.stringify(q.answers)}`);
    console.log('---');
  });

  // Check for language mismatches (English questions with German answers)
  console.log('\n3. English questions with non-English answers:');
  const languageMismatch = await pool.query(`
    SELECT id, question, correct_answer, answers, grade
    FROM questions
    WHERE language = 'en' AND subject = 'science'
    AND (
      answers::text LIKE '%Richtig%'
      OR answers::text LIKE '%Falsch%'
      OR answers::text LIKE '%Vrai%'
      OR answers::text LIKE '%Faux%'
    )
    LIMIT 10
  `);
  console.log(`Found ${languageMismatch.rows.length} questions\n`);
  languageMismatch.rows.forEach(q => {
    console.log(`ID: ${q.id}`);
    console.log(`Question: ${q.question}`);
    console.log(`Correct Answer: ${q.correct_answer}`);
    console.log(`Answers: ${JSON.stringify(q.answers)}`);
    console.log('---');
  });

  // Get total count of English science questions
  console.log('\n4. Summary Statistics:');
  const totalCount = await pool.query(`
    SELECT COUNT(*) as total FROM questions WHERE language = 'en' AND subject = 'science'
  `);
  console.log(`Total English Science Questions: ${totalCount.rows[0].total}`);

  const emptyAnswerCount = await pool.query(`
    SELECT COUNT(*) as count FROM questions
    WHERE language = 'en' AND subject = 'science'
    AND (correct_answer IS NULL OR correct_answer = '')
  `);
  console.log(`Questions with empty correct_answer: ${emptyAnswerCount.rows[0].count}`);

  const nullAnswersCount = await pool.query(`
    SELECT COUNT(*) as count FROM questions
    WHERE language = 'en' AND subject = 'science'
    AND answers IS NULL
  `);
  console.log(`Questions with null answers array: ${nullAnswersCount.rows[0].count}`);

  await pool.end();
}

checkProblematicQuestions().catch(console.error);
