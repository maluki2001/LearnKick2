const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Geographic facts database for validation
const GEOGRAPHIC_FACTS = {
  // Swiss cantons and their capitals
  swissCantons: {
    'Zürich': 'Zürich',
    'Berne': 'Berne',
    'Lucerne': 'Lucerne',
    'Uri': 'Altdorf',
    'Schwyz': 'Schwyz',
    'Obwald': 'Sarnen',
    'Nidwald': 'Stans',
    'Glaris': 'Glaris',
    'Zoug': 'Zoug',
    'Fribourg': 'Fribourg',
    'Soleure': 'Soleure',
    'Bâle-Ville': 'Bâle',
    'Bâle-Campagne': 'Liestal',
    'Schaffhouse': 'Schaffhouse',
    'Appenzell Rhodes-Extérieures': 'Herisau',
    'Appenzell Rhodes-Intérieures': 'Appenzell',
    'Saint-Gall': 'Saint-Gall',
    'Grisons': 'Coire',
    'Argovie': 'Aarau',
    'Thurgovie': 'Frauenfeld',
    'Tessin': 'Bellinzone',
    'Vaud': 'Lausanne',
    'Valais': 'Sion',
    'Neuchâtel': 'Neuchâtel',
    'Genève': 'Genève',
    'Jura': 'Delémont'
  },

  // World capitals
  worldCapitals: {
    'France': 'Paris',
    'Allemagne': 'Berlin',
    'Italie': 'Rome',
    'Autriche': 'Vienne',
    'Espagne': 'Madrid',
    'Portugal': 'Lisbonne',
    'Royaume-Uni': 'Londres',
    'Belgique': 'Bruxelles',
    'Pays-Bas': 'Amsterdam',
    'Suède': 'Stockholm',
    'Norvège': 'Oslo',
    'Danemark': 'Copenhague',
    'Pologne': 'Varsovie',
    'Grèce': 'Athènes',
    'Russie': 'Moscou',
    'États-Unis': 'Washington D.C.',
    'Canada': 'Ottawa',
    'Mexique': 'Mexico',
    'Brésil': 'Brasilia',
    'Argentine': 'Buenos Aires',
    'Chili': 'Santiago',
    'Japon': 'Tokyo',
    'Chine': 'Pékin',
    'Inde': 'New Delhi',
    'Australie': 'Canberra',
    'Égypte': 'Le Caire',
    'Afrique du Sud': 'Pretoria'
  },

  // Swiss cities
  swissCities: ['Zürich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Winterthour', 'Lucerne',
                'Saint-Gall', 'Lugano', 'Bienne', 'Thoune', 'Bellinzone', 'Neuchâtel',
                'Fribourg', 'Sion', 'Delémont'],

  // Swiss mountains
  swissMountains: {
    'Cervin': 4478,
    'Mont Rose': 4634,
    'Jungfrau': 4158,
    'Eiger': 3970,
    'Mönch': 4107,
    'Pilate': 2128,
    'Rigi': 1798,
    'Säntis': 2502
  },

  // Swiss lakes
  swissLakes: ['Lac Léman', 'Lac de Constance', 'Lac de Neuchâtel', 'Lac des Quatre-Cantons',
               'Lac de Zurich', 'Lac de Lugano', 'Lac de Thoune', 'Lac de Brienz'],

  // Swiss rivers
  swissRivers: ['Rhin', 'Rhône', 'Aar', 'Reuss', 'Limmat', 'Inn', 'Ticino'],

  // Continents
  continents: ['Afrique', 'Amérique', 'Amérique du Nord', 'Amérique du Sud', 'Antarctique',
               'Asie', 'Europe', 'Océanie'],

  // Oceans
  oceans: ['Océan Atlantique', 'Océan Pacifique', 'Océan Indien', 'Océan Arctique', 'Océan Austral']
};

async function validateQuestion(question) {
  const validation = {
    id: question.id,
    question: question.question,
    grade: question.grade,
    difficulty: question.difficulty,
    correctAnswer: question.correct_answer,
    answers: question.answers,
    status: 'PASS',
    errors: []
  };

  const questionText = question.question.toLowerCase();
  const correctAnswer = question.correct_answer;
  const answers = question.answers;

  // Validate capital cities questions
  if (questionText.includes('capitale') || questionText.includes('chef-lieu')) {
    // Swiss canton capitals
    if (questionText.includes('canton') || questionText.includes('suisse')) {
      for (const [canton, capital] of Object.entries(GEOGRAPHIC_FACTS.swissCantons)) {
        if (questionText.includes(canton.toLowerCase())) {
          if (correctAnswer !== capital) {
            validation.status = 'FAIL';
            validation.errors.push(`Incorrect capital: ${canton} capital is ${capital}, not ${correctAnswer}`);
          }
          break;
        }
      }
    }

    // World capitals
    for (const [country, capital] of Object.entries(GEOGRAPHIC_FACTS.worldCapitals)) {
      if (questionText.includes(country.toLowerCase())) {
        if (correctAnswer !== capital) {
          validation.status = 'FAIL';
          validation.errors.push(`Incorrect capital: ${country} capital is ${capital}, not ${correctAnswer}`);
        }
        break;
      }
    }
  }

  // Validate canton questions
  if (questionText.includes('canton') && questionText.includes('combien')) {
    if (correctAnswer !== '26' && correctAnswer !== 'vingt-six') {
      validation.status = 'FAIL';
      validation.errors.push(`Switzerland has 26 cantons, not ${correctAnswer}`);
    }
  }

  // Validate mountain heights
  for (const [mountain, height] of Object.entries(GEOGRAPHIC_FACTS.swissMountains)) {
    if (questionText.includes(mountain.toLowerCase())) {
      const heightStr = height.toString();
      if (questionText.includes('altitude') || questionText.includes('mètres') || questionText.includes('haut')) {
        if (!correctAnswer.includes(heightStr)) {
          validation.status = 'FAIL';
          validation.errors.push(`${mountain} is ${height}m, not ${correctAnswer}`);
        }
      }
    }
  }

  // Validate continent/ocean questions
  if (questionText.includes('continent')) {
    const found = GEOGRAPHIC_FACTS.continents.some(c =>
      correctAnswer.toLowerCase().includes(c.toLowerCase())
    );
    if (questionText.includes('combien')) {
      if (correctAnswer !== '7' && correctAnswer !== 'sept') {
        validation.status = 'FAIL';
        validation.errors.push(`There are 7 continents, not ${correctAnswer}`);
      }
    }
  }

  if (questionText.includes('océan')) {
    const found = GEOGRAPHIC_FACTS.oceans.some(o =>
      correctAnswer.toLowerCase().includes(o.toLowerCase())
    );
    if (questionText.includes('combien')) {
      if (correctAnswer !== '5' && correctAnswer !== 'cinq') {
        validation.status = 'FAIL';
        validation.errors.push(`There are 5 oceans, not ${correctAnswer}`);
      }
    }
  }

  // Validate neighboring countries
  if (questionText.includes('pays voisin') || questionText.includes('frontière')) {
    const neighbors = ['France', 'Allemagne', 'Italie', 'Autriche', 'Liechtenstein'];
    const wrongNeighbors = ['Espagne', 'Belgique', 'Pays-Bas', 'Pologne', 'République tchèque'];

    if (wrongNeighbors.some(c => correctAnswer.includes(c))) {
      validation.status = 'FAIL';
      validation.errors.push(`${correctAnswer} does not border Switzerland`);
    }
  }

  // Validate Swiss language regions
  if (questionText.includes('langue') && questionText.includes('suisse')) {
    const languages = ['allemand', 'français', 'italien', 'romanche'];
    if (questionText.includes('combien')) {
      if (correctAnswer !== '4' && correctAnswer !== 'quatre') {
        validation.status = 'FAIL';
        validation.errors.push(`Switzerland has 4 national languages, not ${correctAnswer}`);
      }
    }
  }

  // Check that wrong answers are actually wrong
  if (answers && Array.isArray(answers)) {
    const wrongAnswers = answers.filter(a => a !== correctAnswer);

    // For capital questions, ensure wrong answers aren't correct for other countries/cantons
    if (questionText.includes('capitale') || questionText.includes('chef-lieu')) {
      wrongAnswers.forEach(wrongAnswer => {
        // Check if any wrong answer is actually a correct capital for the mentioned location
        for (const [country, capital] of Object.entries(GEOGRAPHIC_FACTS.worldCapitals)) {
          if (questionText.includes(country.toLowerCase()) && wrongAnswer === capital) {
            validation.status = 'FAIL';
            validation.errors.push(`Wrong answer "${wrongAnswer}" is actually the correct capital of ${country}`);
          }
        }

        for (const [canton, capital] of Object.entries(GEOGRAPHIC_FACTS.swissCantons)) {
          if (questionText.includes(canton.toLowerCase()) && wrongAnswer === capital) {
            validation.status = 'FAIL';
            validation.errors.push(`Wrong answer "${wrongAnswer}" is actually the correct capital of ${canton}`);
          }
        }
      });
    }
  }

  return validation;
}

async function main() {
  console.log('🔍 Starting French Geography Question Validation...\n');

  try {
    // Query French geography questions
    const result = await pool.query(`
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'fr' AND subject = 'geography'
      ORDER BY RANDOM()
      LIMIT 100
    `);

    console.log(`📊 Found ${result.rows.length} French geography questions\n`);

    const validationResults = {
      timestamp: new Date().toISOString(),
      totalQuestions: result.rows.length,
      passed: 0,
      failed: 0,
      questions: []
    };

    const failedQuestionIds = [];

    // Validate each question
    for (const question of result.rows) {
      const validation = await validateQuestion(question);
      validationResults.questions.push(validation);

      if (validation.status === 'PASS') {
        validationResults.passed++;
        console.log(`✅ PASS: ${question.question.substring(0, 60)}...`);
      } else {
        validationResults.failed++;
        failedQuestionIds.push(question.id);
        console.log(`❌ FAIL: ${question.question.substring(0, 60)}...`);
        validation.errors.forEach(error => {
          console.log(`   ⚠️  ${error}`);
        });
      }
    }

    // Update failed questions in database
    if (failedQuestionIds.length > 0) {
      console.log(`\n🔄 Updating ${failedQuestionIds.length} failed questions in database...`);

      for (const id of failedQuestionIds) {
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [id]
        );
      }

      console.log('✅ Database updated');
    }

    // Write results to file
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-fr-geography.json';
    fs.writeFileSync(outputPath, JSON.stringify(validationResults, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions: ${validationResults.totalQuestions}`);
    console.log(`✅ Passed: ${validationResults.passed} (${((validationResults.passed/validationResults.totalQuestions)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${validationResults.failed} (${((validationResults.failed/validationResults.totalQuestions)*100).toFixed(1)}%)`);
    console.log(`\n📄 Results written to: ${outputPath}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
