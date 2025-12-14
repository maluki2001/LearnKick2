const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function validateFrenchScienceQuestions() {
  console.log('Starting French Science Question Validation...\n');

  const results = {
    timestamp: new Date().toISOString(),
    totalQuestions: 0,
    passed: 0,
    failed: 0,
    validationDetails: []
  };

  try {
    // Query 100 random French science questions
    const query = `
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'fr' AND subject = 'science'
      ORDER BY RANDOM()
      LIMIT 100
    `;

    const { rows } = await pool.query(query);
    results.totalQuestions = rows.length;

    console.log(`Found ${rows.length} French science questions to validate\n`);

    for (const q of rows) {
      const validation = validateQuestion(q);
      results.validationDetails.push(validation);

      if (validation.status === 'PASS') {
        results.passed++;
        console.log(`✅ PASS: Q${q.id.substring(0, 8)}... - ${q.question.substring(0, 60)}...`);
      } else {
        results.failed++;
        console.log(`❌ FAIL: Q${q.id.substring(0, 8)}... - ${q.question.substring(0, 60)}...`);
        console.log(`   Reason: ${validation.reason}\n`);

        // Update failed questions in database
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [q.id]
        );
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Questions: ${results.totalQuestions}`);
    console.log(`✅ Passed: ${results.passed} (${(results.passed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${results.failed} (${(results.failed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log('='.repeat(80) + '\n');

    // Write results to JSON file
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-fr-science.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results written to: ${outputPath}`);

  } catch (error) {
    console.error('Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

function validateQuestion(q) {
  const validation = {
    id: q.id,
    question: q.question,
    grade: q.grade,
    difficulty: q.difficulty,
    answers: q.answers,
    correct_answer: q.correct_answer,
    questionType: q.answers === null ? 'true-false' : 'multiple-choice',
    status: 'PASS',
    reason: ''
  };

  const answers = q.answers;
  const correctAnswer = q.correct_answer;
  const grade = parseInt(q.grade);

  // Handle different question formats
  let correctText = '';
  let isTrueFalse = false;

  if (answers === null) {
    // True/false question format (answers is null)
    isTrueFalse = true;
    correctText = correctAnswer; // "true" or "false"

    // Validate true/false format
    if (correctAnswer !== 'true' && correctAnswer !== 'false') {
      validation.status = 'FAIL';
      validation.reason = `Invalid true/false answer: "${correctAnswer}" (must be "true" or "false")`;
      return validation;
    }
  } else if (Array.isArray(answers)) {
    // Multiple choice question - handle both index-based and text-based answers

    // Try parsing as index first
    const correctIndex = parseInt(correctAnswer);

    if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < answers.length) {
      // Index-based answer (e.g., correct_answer: "1")
      correctText = answers[correctIndex];
    } else if (answers.includes(correctAnswer)) {
      // Text-based answer (e.g., correct_answer: "Le cerveau")
      correctText = correctAnswer;
    } else {
      validation.status = 'FAIL';
      validation.reason = `Invalid correct_answer: "${correctAnswer}" (not an index or matching answer)`;
      return validation;
    }

    // Check for duplicate answers (case-insensitive)
    const uniqueAnswers = new Set(answers.map(a => a ? a.toLowerCase().trim() : ''));
    if (uniqueAnswers.size !== answers.length) {
      validation.status = 'FAIL';
      validation.reason = 'Duplicate answers detected';
      return validation;
    }

    // Check that answers are not empty
    if (answers.some(a => !a || a.trim().length === 0)) {
      validation.status = 'FAIL';
      validation.reason = 'Empty answer detected';
      return validation;
    }

    // Special handling for Vrai/Faux questions (treated as true/false)
    if (answers.length === 2 &&
        (answers.includes('Vrai') || answers.includes('Faux') ||
         answers.includes('Richtig') || answers.includes('Falsch'))) {
      isTrueFalse = true;
      // Normalize to true/false
      if (correctText === 'Vrai' || correctText === 'Richtig' || correctText === 'true') {
        correctText = 'true';
      } else if (correctText === 'Faux' || correctText === 'Falsch' || correctText === 'false') {
        correctText = 'false';
      }
    }
  }

  // Validation rules based on scientific accuracy

  // Grade 2 validations
  if (grade === 2) {
    // Basic animal classifications
    if (q.question.includes('mammifère') || q.question.includes('Mammifère')) {
      const incorrectMammals = ['poisson', 'oiseau', 'insecte', 'reptile', 'serpent', 'grenouille'];
      if (correctText && incorrectMammals.some(animal => correctText.toLowerCase().includes(animal))) {
        validation.status = 'FAIL';
        validation.reason = `Incorrect mammal classification: "${correctText}" is not a mammal`;
        return validation;
      }
    }

    // Water states
    if (q.question.includes('glace') && q.question.includes('état')) {
      if (correctText && !correctText.toLowerCase().includes('solide')) {
        validation.status = 'FAIL';
        validation.reason = 'Ice is solid water, not liquid or gas';
        return validation;
      }
    }

    // Plants need sunlight
    if (q.question.includes('plante') && q.question.includes('besoin')) {
      if (correctText && correctText.toLowerCase().includes('obscurité')) {
        validation.status = 'FAIL';
        validation.reason = 'Plants need sunlight, not darkness';
        return validation;
      }
    }
  }

  // Grade 3-4 validations
  if (grade >= 3 && grade <= 4) {
    // Solar system
    if (q.question.includes('Soleil') && q.question.includes('planète')) {
      if (correctText && correctText.toLowerCase().includes('oui')) {
        validation.status = 'FAIL';
        validation.reason = 'The Sun is a star, not a planet';
        return validation;
      }
    }

    // Moon and light
    if (q.question.includes('Lune') && q.question.includes('lumière')) {
      if (correctText && correctText.toLowerCase().includes('produit')) {
        validation.status = 'FAIL';
        validation.reason = 'The Moon reflects light, does not produce it';
        return validation;
      }
    }

    // Photosynthesis
    if (q.question.includes('photosynthèse')) {
      if (correctText && (correctText.toLowerCase().includes('animaux') ||
          correctText.toLowerCase().includes('respiration'))) {
        validation.status = 'FAIL';
        validation.reason = 'Photosynthesis is a plant process using sunlight and CO2';
        return validation;
      }
    }
  }

  // Grade 5-6 validations
  if (grade >= 5 && grade <= 6) {
    // Speed of light vs sound
    if (q.question.includes('lumière') && q.question.includes('son')) {
      if (correctText && correctText.toLowerCase().includes('son est plus rapide')) {
        validation.status = 'FAIL';
        validation.reason = 'Light is faster than sound (300,000 km/s vs 340 m/s)';
        return validation;
      }
    }

    // DNA location
    if (q.question.includes('ADN')) {
      if (correctText && correctText.toLowerCase().includes('cytoplasme')) {
        validation.status = 'FAIL';
        validation.reason = 'DNA is primarily in the nucleus, not cytoplasm';
        return validation;
      }
    }

    // Water boiling point
    if (q.question.includes('ébullition') && q.question.includes('eau')) {
      const temp = parseInt(correctText);
      if (!isNaN(temp) && temp !== 100) {
        validation.status = 'FAIL';
        validation.reason = 'Water boils at 100°C at sea level';
        return validation;
      }
    }

    // Human heart chambers
    if (q.question.includes('cœur') && q.question.includes('cavités')) {
      const num = parseInt(correctText);
      if (!isNaN(num) && num !== 4) {
        validation.status = 'FAIL';
        validation.reason = 'The human heart has 4 chambers';
        return validation;
      }
    }
  }

  // Common validation across all grades

  // TRUE/FALSE VALIDATIONS - Check scientific accuracy of statements
  if (isTrueFalse) {
    const qLower = q.question.toLowerCase();
    const isTrue = correctText === 'true';

    // Animals and Biology
    if (qLower.includes('poisson') && qLower.includes('mammifère')) {
      if (isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Fish are not mammals';
        return validation;
      }
    }

    if (qLower.includes('oiseau') && qLower.includes('plume')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Birds do have feathers';
        return validation;
      }
    }

    if (qLower.includes('insecte') && (qLower.includes('papillon') || qLower.includes('abeille'))) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Butterflies and bees are insects';
        return validation;
      }
    }

    // Water and States of Matter
    if (qLower.includes('glace') && qLower.includes('liquide')) {
      if (isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Ice is solid, not liquid';
        return validation;
      }
    }

    if (qLower.includes('vapeur') && qLower.includes('gaz')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Water vapor is a gas';
        return validation;
      }
    }

    // Plants
    if (qLower.includes('plante') && qLower.includes('soleil') && qLower.includes('besoin')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Plants need sunlight for photosynthesis';
        return validation;
      }
    }

    // Astronomy
    if (qLower.includes('soleil') && qLower.includes('étoile')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'The Sun is a star';
        return validation;
      }
    }

    if (qLower.includes('lune') && qLower.includes('planète')) {
      if (isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'The Moon is a satellite, not a planet';
        return validation;
      }
    }

    // Earth and Seasons
    if (qLower.includes('terre') && qLower.includes('tourne')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Earth does rotate';
        return validation;
      }
    }

    // Human Body
    if (qLower.includes('cœur') && qLower.includes('pompe') && qLower.includes('sang')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'The heart pumps blood';
        return validation;
      }
    }

    // Physics
    if (qLower.includes('aimant') && qLower.includes('fer')) {
      if (!isTrue) {
        validation.status = 'FAIL';
        validation.reason = 'Magnets attract iron';
        return validation;
      }
    }
  }

  // MULTIPLE CHOICE VALIDATIONS
  // Gravity direction
  if (!isTrueFalse && (q.question.includes('gravité') || q.question.includes('gravitation'))) {
    if (correctText && (correctText.toLowerCase().includes('haut') ||
        correctText.toLowerCase().includes('monte'))) {
      validation.status = 'FAIL';
      validation.reason = 'Gravity pulls downward, not upward';
      return validation;
    }
  }

  // Number of continents
  if (q.question.includes('continent')) {
    const num = parseInt(correctText);
    if (!isNaN(num) && (num < 5 || num > 7)) {
      validation.status = 'FAIL';
      validation.reason = 'Number of continents is typically 5-7 depending on model';
      return validation;
    }
  }

  // Earth shape
  if (q.question.includes('Terre') && q.question.includes('forme')) {
    if (correctText && (correctText.toLowerCase().includes('plate') ||
        correctText.toLowerCase().includes('carrée'))) {
      validation.status = 'FAIL';
      validation.reason = 'Earth is spherical/round, not flat or square';
      return validation;
    }
  }

  // Seasons cause
  if (q.question.includes('saisons') && q.question.includes('causées')) {
    if (correctText && correctText.toLowerCase().includes('distance')) {
      validation.status = 'FAIL';
      validation.reason = 'Seasons are caused by Earth\'s axial tilt, not distance from Sun';
      return validation;
    }
  }

  return validation;
}

// Run validation
validateFrenchScienceQuestions()
  .then(() => {
    console.log('\nValidation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
