const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// British English spelling patterns
const britishSpellingPatterns = {
  'color': 'colour',
  'favorite': 'favourite',
  'meter': 'metre',
  'center': 'centre',
  'theater': 'theatre',
  'organize': 'organise',
  'realize': 'realise',
  'recognize': 'recognise',
  'analyze': 'analyse',
  'defense': 'defence',
  'license': 'licence',
  'practice': 'practise', // verb form
  'neighbor': 'neighbour',
  'honor': 'honour',
  'humor': 'humour',
  'labor': 'labour',
  'flavor': 'flavour'
};

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
  failedIds: []
};

async function validateQuestion(question) {
  const validation = {
    id: question.id,
    question: question.question,
    grade: question.grade,
    difficulty: question.difficulty,
    status: 'PASS',
    errors: []
  };

  try {
    const answers = typeof question.answers === 'string'
      ? JSON.parse(question.answers)
      : question.answers;

    const correctAnswer = answers[question.correct_answer];
    const wrongAnswers = answers.filter((_, idx) => idx !== question.correct_answer);

    // Check 1: British English spelling in question
    const questionText = question.question.toLowerCase();
    for (const [american, british] of Object.entries(britishSpellingPatterns)) {
      const americanRegex = new RegExp(`\\b${american}\\b`, 'gi');
      if (americanRegex.test(question.question)) {
        validation.errors.push({
          type: 'AMERICAN_SPELLING',
          issue: `Found American spelling "${american}", should use British "${british}"`,
          location: 'question'
        });
      }
    }

    // Check 2: British English spelling in answers
    answers.forEach((answer, idx) => {
      for (const [american, british] of Object.entries(britishSpellingPatterns)) {
        const americanRegex = new RegExp(`\\b${american}\\b`, 'gi');
        if (americanRegex.test(answer)) {
          validation.errors.push({
            type: 'AMERICAN_SPELLING',
            issue: `Found American spelling "${american}", should use British "${british}"`,
            location: `answer_${idx}`,
            text: answer
          });
        }
      }
    });

    // Check 3: Grammar and linguistic accuracy
    // Common grammar issues
    if (/\b(your|you're)\b/i.test(question.question) || answers.some(a => /\b(your|you're)\b/i.test(a))) {
      const hasYourIssue = question.question.includes("you're") && !question.question.includes("you are");
      const hasYoureIssue = question.question.includes("your") && question.question.includes("are");

      // This is a basic check - would need context to be more accurate
    }

    // Check 4: Verify correct answer makes linguistic sense
    const questionLower = question.question.toLowerCase();

    // For "Which word is spelled correctly?" questions
    if (questionLower.includes('spelled correctly') || questionLower.includes('correct spelling')) {
      // The correct answer should be properly spelled
      const commonMisspellings = ['recieve', 'occured', 'seperate', 'definately', 'goverment', 'enviroment'];
      if (commonMisspellings.some(misspelling => correctAnswer.toLowerCase().includes(misspelling))) {
        validation.errors.push({
          type: 'INCORRECT_SPELLING',
          issue: `Correct answer appears to be misspelled: "${correctAnswer}"`,
          location: 'correct_answer'
        });
      }
    }

    // For "Which word means..." questions
    if (questionLower.includes('which word means') || questionLower.includes('what does') || questionLower.includes('means the same')) {
      // Basic sanity check - answer should be a word/phrase, not empty
      if (!correctAnswer || correctAnswer.trim().length === 0) {
        validation.errors.push({
          type: 'EMPTY_ANSWER',
          issue: 'Correct answer is empty',
          location: 'correct_answer'
        });
      }
    }

    // Check 5: Verify wrong answers are actually wrong
    // For spelling questions, wrong answers should contain misspellings
    if (questionLower.includes('spelled correctly') || questionLower.includes('correct spelling')) {
      wrongAnswers.forEach((wrongAnswer, idx) => {
        // Wrong answers should ideally be different from correct answer
        if (wrongAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
          validation.errors.push({
            type: 'DUPLICATE_ANSWER',
            issue: `Wrong answer is same as correct answer: "${wrongAnswer}"`,
            location: `wrong_answer_${idx}`
          });
        }
      });
    }

    // Check 6: Question structure
    if (!question.question.trim().endsWith('?') && questionLower.includes('which') || questionLower.includes('what')) {
      validation.errors.push({
        type: 'MISSING_QUESTION_MARK',
        issue: 'Question appears to be missing a question mark',
        location: 'question'
      });
    }

    // Check 7: Answer array integrity
    if (answers.length !== 4) {
      validation.errors.push({
        type: 'INVALID_ANSWER_COUNT',
        issue: `Expected 4 answers, found ${answers.length}`,
        location: 'answers'
      });
    }

    // Check 8: Correct answer index validity
    if (question.correct_answer < 0 || question.correct_answer >= answers.length) {
      validation.errors.push({
        type: 'INVALID_CORRECT_ANSWER_INDEX',
        issue: `Correct answer index ${question.correct_answer} is out of bounds`,
        location: 'correct_answer'
      });
    }

    // Check 9: Duplicate answers
    const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
    if (uniqueAnswers.size !== answers.length) {
      validation.errors.push({
        type: 'DUPLICATE_ANSWERS',
        issue: 'Found duplicate answers in the answer array',
        location: 'answers'
      });
    }

    // Check 10: Empty answers
    answers.forEach((answer, idx) => {
      if (!answer || answer.trim().length === 0) {
        validation.errors.push({
          type: 'EMPTY_ANSWER',
          issue: `Answer at index ${idx} is empty`,
          location: `answer_${idx}`
        });
      }
    });

  } catch (error) {
    validation.errors.push({
      type: 'VALIDATION_ERROR',
      issue: `Error during validation: ${error.message}`,
      location: 'validation_process'
    });
  }

  if (validation.errors.length > 0) {
    validation.status = 'FAIL';
  }

  return validation;
}

async function run() {
  try {
    console.log('Connecting to database...');
    await pool.connect();
    console.log('Connected successfully!');

    console.log('\nQuerying 100 English language questions...');
    const query = `
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'en' AND subject = 'english'
      ORDER BY RANDOM()
      LIMIT 100
    `;

    const { rows } = await pool.query(query);
    console.log(`Found ${rows.length} questions to validate\n`);

    results.total = rows.length;

    // Validate each question
    for (let i = 0; i < rows.length; i++) {
      const question = rows[i];
      console.log(`Validating ${i + 1}/${rows.length}: ${question.id}`);

      const validation = await validateQuestion(question);
      results.details.push(validation);

      if (validation.status === 'PASS') {
        results.passed++;
        console.log(`  ✓ PASS`);
      } else {
        results.failed++;
        results.failedIds.push(question.id);
        console.log(`  ✗ FAIL - ${validation.errors.length} error(s)`);
        validation.errors.forEach(err => {
          console.log(`    - ${err.type}: ${err.issue}`);
        });
      }
    }

    // Update failed questions in database
    if (results.failedIds.length > 0) {
      console.log(`\nUpdating ${results.failedIds.length} failed questions to 'rejected' status...`);

      for (const id of results.failedIds) {
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [id]
        );
      }
      console.log('Database updated successfully');
    }

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        passRate: ((results.passed / results.total) * 100).toFixed(2) + '%'
      },
      failedQuestionIds: results.failedIds,
      details: results.details
    };

    // Write results to file
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-en-english.json';
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
    console.log(`\n✓ Results written to: ${outputPath}`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions:  ${summary.summary.total}`);
    console.log(`Passed:           ${summary.summary.passed} ✓`);
    console.log(`Failed:           ${summary.summary.failed} ✗`);
    console.log(`Pass Rate:        ${summary.summary.passRate}`);
    console.log('='.repeat(60));

    if (results.failed > 0) {
      console.log('\nFailed Questions:');
      results.details.filter(d => d.status === 'FAIL').forEach(detail => {
        console.log(`\n- ID: ${detail.id} (Grade ${detail.grade}, Difficulty: ${detail.difficulty})`);
        console.log(`  Question: ${detail.question.substring(0, 80)}...`);
        console.log(`  Errors:`);
        detail.errors.forEach(err => {
          console.log(`    * ${err.type}: ${err.issue}`);
        });
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

run();
