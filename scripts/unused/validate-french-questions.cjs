const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function validateFrenchQuestions() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    questions: []
  };

  try {
    console.log('🔍 Fetching 100 French language questions...\n');

    const queryResult = await pool.query(`
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'fr' AND subject = 'french'
      ORDER BY RANDOM()
      LIMIT 100
    `);

    const questions = queryResult.rows;
    results.total = questions.length;

    console.log(`📊 Found ${questions.length} questions to validate\n`);
    console.log('=' .repeat(80));

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionNum = i + 1;

      console.log(`\n[${questionNum}/${questions.length}] ID: ${q.id}`);
      console.log(`Grade: ${q.grade} | Difficulty: ${q.difficulty}`);
      console.log(`Question: ${q.question}`);

      const answers = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
      console.log(`Answers: ${JSON.stringify(answers)}`);
      console.log(`Correct: ${q.correct_answer}`);

      const validation = validateQuestion(q, answers);

      const status = validation.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\nStatus: ${status}`);

      if (validation.issues.length > 0) {
        console.log('Issues:');
        validation.issues.forEach(issue => console.log(`  - ${issue}`));
      }

      results.questions.push({
        id: q.id,
        grade: q.grade,
        difficulty: q.difficulty,
        question: q.question,
        answers: answers,
        correct_answer: q.correct_answer,
        validation: {
          passed: validation.passed,
          issues: validation.issues
        }
      });

      if (validation.passed) {
        results.passed++;
      } else {
        results.failed++;

        // Update failed questions in database
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [q.id]
        );
        console.log('  ⚠️  Marked as rejected in database');
      }

      console.log('-'.repeat(80));
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📈 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Questions: ${results.total}`);
    console.log(`✅ Passed: ${results.passed} (${((results.passed/results.total)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${results.failed} (${((results.failed/results.total)*100).toFixed(1)}%)`);
    console.log('='.repeat(80));

    // Write results to JSON file
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-fr-french.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

function validateQuestion(question, answers) {
  const issues = [];
  let passed = true;

  // Validate question text
  if (!question.question || question.question.trim().length === 0) {
    issues.push('Question text is empty');
    passed = false;
  }

  // Check for common French grammar issues in question
  const questionText = question.question.toLowerCase();

  // Check for proper French punctuation (space before ?)
  if (question.question.includes('?') && !question.question.match(/\s\?/)) {
    issues.push('Missing space before question mark (French typography rule)');
    passed = false;
  }

  // Validate answers array
  if (!Array.isArray(answers) || answers.length !== 4) {
    issues.push('Answers must be an array of 4 options');
    passed = false;
    return { passed, issues };
  }

  // Validate correct answer exists in answers
  if (!answers.includes(question.correct_answer)) {
    issues.push('Correct answer not found in answer options');
    passed = false;
  }

  // Check each answer for basic French validity
  answers.forEach((answer, idx) => {
    if (!answer || answer.trim().length === 0) {
      issues.push(`Answer ${idx + 1} is empty`);
      passed = false;
    }

    const answerLower = answer.toLowerCase();

    // Common French grammar checks
    checkFrenchGrammar(answer, answerLower, issues, question.correct_answer === answer);
  });

  // Check for duplicate answers
  const uniqueAnswers = new Set(answers.map(a => a.toLowerCase().trim()));
  if (uniqueAnswers.size !== answers.length) {
    issues.push('Duplicate answers detected');
    passed = false;
  }

  return { passed, issues };
}

function checkFrenchGrammar(answer, answerLower, issues, isCorrect) {
  // Check for common French grammar patterns

  // Incorrect article-noun agreement patterns (basic checks)
  const wrongArticles = [
    /\ble une\b/,  // "le une" is wrong
    /\bla un\b/,   // "la un" is wrong
    /\bun les\b/,  // "un les" is wrong
  ];

  wrongArticles.forEach(pattern => {
    if (pattern.test(answerLower)) {
      issues.push(`Grammar error in "${answer}": Article agreement issue`);
    }
  });

  // Check for Swiss French number errors (should use septante/huitante/nonante)
  if (answerLower.includes('soixante-dix') || answerLower.includes('quatre-vingt')) {
    issues.push(`Use Swiss French numbers: "${answer}" should use septante/huitante/nonante`);
  }

  // Common verb conjugation errors (basic patterns)
  const conjugationErrors = [
    { pattern: /\bje (va|fait|a|prends)\b/, error: 'je conjugation' },
    { pattern: /\btu (va|fait|a|prend)\b/, error: 'tu conjugation' },
    { pattern: /\bil\/elle (vont|font|ont|prennent)\b/, error: 'il/elle conjugation' },
    { pattern: /\bnous (va|fait|a|prend)\b/, error: 'nous conjugation' },
  ];

  conjugationErrors.forEach(({ pattern, error }) => {
    if (pattern.test(answerLower)) {
      issues.push(`Verb conjugation error in "${answer}": ${error}`);
    }
  });

  // Check for missing accents in common words
  const missingAccents = [
  ];

  if (answer.includes('eleve') && !answer.includes('élève')) {
    issues.push(`Missing accent: "${answer}" should be "élève"`);
  }
  if (answer.includes('ecole') && !answer.includes('école')) {
    issues.push(`Missing accent: "${answer}" should be "école"`);
  }
  if (answer.includes('etre') && !answer.includes('être')) {
    issues.push(`Missing accent: "${answer}" should be "être"`);
  }

  // Check for double spaces
  if (answer.includes('  ')) {
    issues.push(`Extra spaces in "${answer}"`);
  }

  // Check for proper capitalization at start
  if (answer.length > 0 && /^[a-zàâäéèêëïîôùûüÿæœç]/.test(answer)) {
    // Only flag if it's a full sentence (contains verb indicators)
    if (answerLower.includes(' est ') || answerLower.includes(' sont ') ||
        answerLower.includes(' a ') || answerLower.includes(' ont ')) {
      issues.push(`Capitalization: "${answer}" might need to start with capital letter`);
    }
  }

  // Check for common spelling errors
  const spellingErrors = [
    { wrong: 'language', right: 'langue' },
    { wrong: 'francais', right: 'français' },
    { wrong: 'grammaire', right: 'grammaire' },  // Actually correct, just checking
  ];

  spellingErrors.forEach(({ wrong, right }) => {
    if (answerLower.includes(wrong) && wrong !== right) {
      issues.push(`Spelling: "${answer}" contains "${wrong}" should be "${right}"`);
    }
  });
}

// Run validation
validateFrenchQuestions()
  .then(() => {
    console.log('\n✅ Validation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  });
