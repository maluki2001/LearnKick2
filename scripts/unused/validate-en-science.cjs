const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Scientific validation rules and common knowledge base
const scientificKnowledge = {
  planets: {
    mercury: { order: 1, type: 'terrestrial', moons: 0 },
    venus: { order: 2, type: 'terrestrial', moons: 0 },
    earth: { order: 3, type: 'terrestrial', moons: 1 },
    mars: { order: 4, type: 'terrestrial', moons: 2 },
    jupiter: { order: 5, type: 'gas giant', moons: 95 },
    saturn: { order: 6, type: 'gas giant', moons: 146 },
    uranus: { order: 7, type: 'ice giant', moons: 27 },
    neptune: { order: 8, type: 'ice giant', moons: 14 }
  },

  statesOfMatter: ['solid', 'liquid', 'gas', 'plasma'],

  waterCycle: ['evaporation', 'condensation', 'precipitation', 'collection'],

  bodyParts: {
    heart: 'pumps blood',
    lungs: 'breathing/gas exchange',
    brain: 'control center/thinking',
    stomach: 'digestion',
    liver: 'filters toxins',
    kidneys: 'filter waste/produce urine'
  },

  photosynthesis: {
    inputs: ['sunlight', 'water', 'carbon dioxide'],
    outputs: ['oxygen', 'glucose/sugar']
  }
};

// Validate a single question
async function validateQuestion(question) {
  const result = {
    id: question.id,
    question: question.question,
    grade: question.grade,
    difficulty: question.difficulty,
    status: 'PASS',
    issues: [],
    correctAnswer: question.correct_answer,
    answers: question.answers
  };

  // Handle null values
  if (!question.question || !question.correct_answer) {
    result.status = 'FAIL';
    result.issues.push('Missing question or correct_answer field');
    return result;
  }

  if (!question.answers || !Array.isArray(question.answers)) {
    result.status = 'FAIL';
    result.issues.push('Missing or invalid answers array');
    return result;
  }

  const q = question.question.toLowerCase();
  const correctAnswer = question.correct_answer.toLowerCase();
  const answers = question.answers.map(a => a ? a.toLowerCase() : '');

  // Validation checks

  // 1. Planet order questions
  if (q.includes('closest planet to the sun') || q.includes('nearest planet to sun')) {
    if (!correctAnswer.includes('mercury')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Mercury is closest planet to the Sun');
    }
  }

  if (q.includes('largest planet')) {
    if (!correctAnswer.includes('jupiter')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Jupiter is the largest planet');
    }
  }

  if (q.includes('red planet')) {
    if (!correctAnswer.includes('mars')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Mars is known as the Red Planet');
    }
  }

  // 2. States of matter
  if (q.includes('three states of matter') || q.includes('three main states')) {
    const hasCorrectStates = correctAnswer.includes('solid') &&
                            correctAnswer.includes('liquid') &&
                            correctAnswer.includes('gas');
    if (!hasCorrectStates) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Three states of matter are solid, liquid, and gas');
    }
  }

  if (q.includes('ice') && q.includes('state of matter')) {
    if (!correctAnswer.includes('solid')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Ice is a solid state of matter');
    }
  }

  if ((q.includes('water vapour') || q.includes('water vapor')) && q.includes('state of matter')) {
    if (!correctAnswer.includes('gas')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Water vapour is a gas');
    }
  }

  // 3. Water cycle
  if (q.includes('water turns into vapour') || q.includes('water becomes gas')) {
    if (!correctAnswer.includes('evaporation')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Water turning into vapour is evaporation');
    }
  }

  if (q.includes('water vapour cools') || q.includes('clouds form')) {
    if (!correctAnswer.includes('condensation')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Water vapour cooling/clouds forming is condensation');
    }
  }

  if (q.includes('rain') && q.includes('falls')) {
    if (!correctAnswer.includes('precipitation')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Rain falling is precipitation');
    }
  }

  // 4. Photosynthesis
  if (q.includes('photosynthesis') && q.includes('produce')) {
    if (q.includes('oxygen') || q.includes('sugar') || q.includes('food')) {
      if (!correctAnswer.includes('oxygen') && !correctAnswer.includes('sugar') && !correctAnswer.includes('glucose')) {
        result.status = 'FAIL';
        result.issues.push('Incorrect: Photosynthesis produces oxygen and sugar/glucose');
      }
    }
  }

  if (q.includes('plants need') && q.includes('photosynthesis')) {
    if (!correctAnswer.includes('sunlight') && !correctAnswer.includes('sun') && !correctAnswer.includes('light')) {
      if (q.includes('light') || q.includes('sun')) {
        result.status = 'FAIL';
        result.issues.push('Incorrect: Plants need sunlight for photosynthesis');
      }
    }
  }

  // 5. Body parts and functions
  if (q.includes('heart') && q.includes('pump')) {
    if (!correctAnswer.includes('blood')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Heart pumps blood');
    }
  }

  if (q.includes('lungs') && q.includes('breathe')) {
    if (!correctAnswer.includes('oxygen') && !correctAnswer.includes('air')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Lungs are for breathing air/oxygen');
    }
  }

  if (q.includes('brain') && (q.includes('thinking') || q.includes('control'))) {
    if (correctAnswer.includes('pump blood') || correctAnswer.includes('digest')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Brain is for thinking/control, not pumping blood or digestion');
    }
  }

  // 6. Basic physics
  if (q.includes('gravity') && q.includes('fall')) {
    if (correctAnswer.includes('up')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Gravity pulls objects down, not up');
    }
  }

  if (q.includes('boiling point') && q.includes('water')) {
    if (correctAnswer.includes('0') || correctAnswer.includes('zero')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Water boiling point is 100°C, freezing is 0°C');
    }
  }

  if (q.includes('freezing') && q.includes('water')) {
    if (correctAnswer.includes('100')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Water freezing point is 0°C, boiling is 100°C');
    }
  }

  // 7. Food chains and ecosystems
  if (q.includes('producer') && (q.includes('food chain') || q.includes('ecosystem'))) {
    if (!correctAnswer.includes('plant') && !correctAnswer.includes('algae')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Producers in food chains are plants/algae');
    }
  }

  if (q.includes('carnivore')) {
    if (correctAnswer.includes('plant') || correctAnswer.includes('grass')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Carnivores eat meat, not plants');
    }
  }

  if (q.includes('herbivore')) {
    if (correctAnswer.includes('meat') || correctAnswer.includes('animal')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Herbivores eat plants, not meat');
    }
  }

  // 8. Living vs non-living
  if (q.includes('living thing') || q.includes('alive')) {
    if (correctAnswer.includes('rock') || correctAnswer.includes('water') || correctAnswer.includes('air')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Rocks, water, and air are not living things');
    }
  }

  // 9. Earth science
  if (q.includes('volcanic rock') || q.includes('lava')) {
    if (!correctAnswer.includes('igneous') && q.includes('type of rock')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Volcanic/lava rock is igneous rock');
    }
  }

  if (q.includes('earth') && q.includes('rotate') && q.includes('day')) {
    if (!correctAnswer.includes('24') && !correctAnswer.includes('one day')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Earth rotates in 24 hours (one day)');
    }
  }

  if (q.includes('moon') && q.includes('earth')) {
    if (q.includes('orbit') && correctAnswer.includes('sun')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Moon orbits Earth, not Sun');
    }
  }

  // 10. Energy and forces
  if (q.includes('energy from sun') || q.includes('solar energy')) {
    if (!correctAnswer.includes('light') && !correctAnswer.includes('heat') && q.includes('form')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Solar energy is light and heat energy');
    }
  }

  if (q.includes('magnetic') && q.includes('material')) {
    if (correctAnswer.includes('plastic') || correctAnswer.includes('wood')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Plastic and wood are not magnetic materials');
    }
    if (!correctAnswer.includes('iron') && !correctAnswer.includes('steel') && !correctAnswer.includes('metal')) {
      result.status = 'FAIL';
      result.issues.push('Incorrect: Magnetic materials include iron, steel, and some metals');
    }
  }

  // 11. Check for contradictions in answers
  const allAnswers = [...answers];
  if (allAnswers.includes(correctAnswer)) {
    // Good - correct answer is in the list
  } else {
    result.status = 'FAIL';
    result.issues.push('Correct answer not found in answer list');
  }

  // 12. Grade appropriateness check
  if (question.grade <= 2) {
    const complexTerms = ['photosynthesis', 'evaporation', 'condensation', 'precipitation',
                          'carnivore', 'herbivore', 'omnivore', 'ecosystem'];
    const hasComplexTerm = complexTerms.some(term => q.includes(term));
    if (hasComplexTerm) {
      result.issues.push('WARNING: May be too complex for grade ' + question.grade);
    }
  }

  if (question.grade >= 5) {
    const tooSimpleTerms = ['what color', 'how many legs', 'is the sun'];
    const isTooSimple = tooSimpleTerms.some(term => q.includes(term));
    if (isTooSimple) {
      result.issues.push('WARNING: May be too simple for grade ' + question.grade);
    }
  }

  return result;
}

async function main() {
  console.log('Starting English Science Question Validation...\n');

  try {
    // Query 100 random English science questions
    const queryResult = await pool.query(`
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'en' AND subject = 'science'
      ORDER BY RANDOM()
      LIMIT 100
    `);

    console.log(`Found ${queryResult.rows.length} questions to validate\n`);

    const results = {
      totalQuestions: queryResult.rows.length,
      passed: 0,
      failed: 0,
      warnings: 0,
      questionResults: []
    };

    // Validate each question
    for (let i = 0; i < queryResult.rows.length; i++) {
      const question = queryResult.rows[i];
      console.log(`Validating question ${i + 1}/${queryResult.rows.length}...`);

      const validationResult = await validateQuestion(question);
      results.questionResults.push(validationResult);

      if (validationResult.status === 'PASS' && validationResult.issues.length === 0) {
        results.passed++;
      } else if (validationResult.status === 'FAIL') {
        results.failed++;
        console.log(`  ❌ FAIL: Question ID ${validationResult.id}`);
        console.log(`     Issues: ${validationResult.issues.join(', ')}`);

        // Update failed questions in database
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [validationResult.id]
        );
      } else if (validationResult.issues.length > 0) {
        results.warnings++;
        console.log(`  ⚠️  WARNING: Question ID ${validationResult.id}`);
        console.log(`     Issues: ${validationResult.issues.join(', ')}`);
      } else {
        results.passed++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions: ${results.totalQuestions}`);
    console.log(`✅ Passed: ${results.passed} (${(results.passed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${results.failed} (${(results.failed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${results.warnings} (${(results.warnings/results.totalQuestions*100).toFixed(1)}%)`);
    console.log('='.repeat(60));

    // Write results to file
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-en-science.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results written to: ${outputPath}`);

    // Show failed questions
    if (results.failed > 0) {
      console.log('\nFailed Questions:');
      results.questionResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`\nID: ${r.id}`);
          console.log(`Question: ${r.question}`);
          console.log(`Correct Answer: ${r.correctAnswer}`);
          console.log(`Issues: ${r.issues.join('; ')}`);
        });
    }

  } catch (error) {
    console.error('Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
