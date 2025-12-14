const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Validation rules
const BRITISH_SPELLINGS = {
  'color': 'colour',
  'favorite': 'favourite',
  'honor': 'honour',
  'flavor': 'flavour',
  'neighbor': 'neighbour',
  'center': 'centre',
  'meter': 'metre',
  'liter': 'litre',
  'theater': 'theatre',
  'traveled': 'travelled',
  'organized': 'organised',
  'recognize': 'recognise'
};

const SWISS_FRENCH_NUMBERS = {
  'soixante-dix': 'septante',
  'quatre-vingt': 'huitante',
  'quatre-vingt-dix': 'nonante',
  '70': 'septante',
  '80': 'huitante',
  '90': 'nonante'
};

const results = {
  total: 0,
  approved: { en: 0, fr: 0 },
  rejected: { en: 0, fr: 0 },
  flagged: { en: 0, fr: 0 },
  issues: []
};

function checkBritishSpelling(text) {
  const issues = [];
  const lowerText = text.toLowerCase();

  for (const [american, british] of Object.entries(BRITISH_SPELLINGS)) {
    const regex = new RegExp(`\\b${american}\\b`, 'gi');
    if (regex.test(lowerText)) {
      issues.push(`American spelling detected: "${american}" should be "${british}"`);
    }
  }

  return issues;
}

function checkSwissFrenchNumbers(text) {
  const issues = [];
  const lowerText = text.toLowerCase();

  // Check for standard French numbers that should be Swiss French
  if (lowerText.includes('soixante-dix') || lowerText.includes('soixante dix')) {
    issues.push('Should use Swiss French "septante" instead of "soixante-dix"');
  }
  if (lowerText.includes('quatre-vingt') && !lowerText.includes('quatre-vingt-dix')) {
    issues.push('Should use Swiss French "huitante" instead of "quatre-vingt"');
  }
  if (lowerText.includes('quatre-vingt-dix') || lowerText.includes('quatre vingt dix')) {
    issues.push('Should use Swiss French "nonante" instead of "quatre-vingt-dix"');
  }

  return issues;
}

function validateMultipleChoice(question) {
  const issues = [];

  if (!question.answers || !Array.isArray(question.answers)) {
    issues.push('Missing or invalid answers array');
    return issues;
  }

  if (question.answers.length !== 4) {
    issues.push(`Should have 4 answer options, found ${question.answers.length}`);
  }

  if (!question.correct_answer || question.correct_answer.trim() === '') {
    issues.push('Missing correct answer');
    return issues;
  }

  const correctAnswerExists = question.answers.includes(question.correct_answer);
  if (!correctAnswerExists) {
    issues.push('Correct answer not found in answer options');
  }

  // Check for duplicate answers
  const uniqueAnswers = new Set(question.answers);
  if (uniqueAnswers.size !== question.answers.length) {
    issues.push('Duplicate answer options detected');
  }

  return issues;
}

function validateTrueFalse(question) {
  const issues = [];

  const validAnswers = ['true', 'false', 'True', 'False', 'TRUE', 'FALSE', 'vrai', 'faux', 'Vrai', 'Faux'];
  if (!validAnswers.includes(question.correct_answer)) {
    issues.push(`Invalid true/false answer: "${question.correct_answer}"`);
  }

  return issues;
}

function validateNumberInput(question) {
  const issues = [];

  const num = parseFloat(question.correct_answer);
  if (isNaN(num)) {
    issues.push(`Correct answer is not a valid number: "${question.correct_answer}"`);
  }

  return issues;
}

async function validateQuestion(question) {
  const issues = [];

  // Language-specific validation
  if (question.language === 'en') {
    const spellingIssues = checkBritishSpelling(question.question);
    issues.push(...spellingIssues);

    // Check answers for British spelling too
    if (question.answers && Array.isArray(question.answers)) {
      question.answers.forEach((answer, idx) => {
        const answerIssues = checkBritishSpelling(answer);
        answerIssues.forEach(issue => {
          issues.push(`Answer ${idx + 1}: ${issue}`);
        });
      });
    }
  }

  if (question.language === 'fr') {
    const numberIssues = checkSwissFrenchNumbers(question.question);
    issues.push(...numberIssues);

    // Check answers for Swiss French numbers
    if (question.answers && Array.isArray(question.answers)) {
      question.answers.forEach((answer, idx) => {
        const answerIssues = checkSwissFrenchNumbers(answer);
        answerIssues.forEach(issue => {
          issues.push(`Answer ${idx + 1}: ${issue}`);
        });
      });
    }
  }

  // Type-specific validation
  switch (question.type) {
    case 'multiple-choice':
    case 'multiple_choice':
    case 'image-question':
      issues.push(...validateMultipleChoice(question));
      break;
    case 'true-false':
    case 'true_false':
      issues.push(...validateTrueFalse(question));
      break;
    case 'number-input':
    case 'number_input':
      issues.push(...validateNumberInput(question));
      break;
    default:
      issues.push(`Unknown question type: ${question.type}`);
  }

  // Basic validation
  if (!question.question || question.question.trim() === '') {
    issues.push('Question text is empty');
  }

  if (!question.grade || question.grade < 1 || question.grade > 6) {
    issues.push(`Invalid grade: ${question.grade}`);
  }

  return issues;
}

async function run() {
  try {
    console.log('🔍 Starting question validation...\n');

    // Fetch questions
    const query = `
      SELECT id, question, type, answers, correct_answer, grade, difficulty, language, subject
      FROM questions
      WHERE language IN ('en', 'fr')
      ORDER BY language, grade
      LIMIT 100
    `;

    const { rows: questions } = await pool.query(query);
    console.log(`📊 Found ${questions.length} questions to validate\n`);

    results.total = questions.length;

    // Validate each question
    for (const question of questions) {
      const issues = await validateQuestion(question);

      let status, qualityScore;

      if (issues.length === 0) {
        status = 'approved';
        qualityScore = 95;
        results.approved[question.language]++;
      } else if (issues.some(i => i.includes('Missing') || i.includes('Invalid') || i.includes('not found'))) {
        status = 'rejected';
        qualityScore = 30;
        results.rejected[question.language]++;

        results.issues.push({
          id: question.id,
          language: question.language,
          grade: question.grade,
          question: question.question.substring(0, 60) + '...',
          issues: issues
        });
      } else {
        status = 'flagged';
        qualityScore = 60;
        results.flagged[question.language]++;

        results.issues.push({
          id: question.id,
          language: question.language,
          grade: question.grade,
          question: question.question.substring(0, 60) + '...',
          issues: issues
        });
      }

      // Update database
      await pool.query(
        `UPDATE questions
         SET validation_status = $1, quality_score = $2
         WHERE id = $3`,
        [status, qualityScore, question.id]
      );
    }

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                  VALIDATION SUMMARY                       ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📈 Total Questions Validated: ${results.total}`);
    console.log('\n✅ APPROVED:');
    console.log(`   English: ${results.approved.en}`);
    console.log(`   French:  ${results.approved.fr}`);
    console.log(`   Total:   ${results.approved.en + results.approved.fr} (${Math.round((results.approved.en + results.approved.fr) / results.total * 100)}%)`);

    console.log('\n⚠️  FLAGGED (needs review):');
    console.log(`   English: ${results.flagged.en}`);
    console.log(`   French:  ${results.flagged.fr}`);
    console.log(`   Total:   ${results.flagged.en + results.flagged.fr} (${Math.round((results.flagged.en + results.flagged.fr) / results.total * 100)}%)`);

    console.log('\n❌ REJECTED:');
    console.log(`   English: ${results.rejected.en}`);
    console.log(`   French:  ${results.rejected.fr}`);
    console.log(`   Total:   ${results.rejected.en + results.rejected.fr} (${Math.round((results.rejected.en + results.rejected.fr) / results.total * 100)}%)`);

    // Print issues
    if (results.issues.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('                    ISSUES FOUND                           ');
      console.log('═══════════════════════════════════════════════════════════\n');

      results.issues.forEach((item, idx) => {
        console.log(`${idx + 1}. [${item.language.toUpperCase()}] Grade ${item.grade}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Question: "${item.question}"`);
        console.log(`   Issues:`);
        item.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ Validation complete!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

run();
