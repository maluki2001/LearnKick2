const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Factual geography knowledge base for validation
const geographyFacts = {
  swissCantons: {
    'Zurich': { capital: 'Zurich', german: 'Zürich' },
    'Bern': { capital: 'Bern' },
    'Lucerne': { capital: 'Lucerne', german: 'Luzern' },
    'Uri': { capital: 'Altdorf' },
    'Schwyz': { capital: 'Schwyz' },
    'Obwalden': { capital: 'Sarnen' },
    'Nidwalden': { capital: 'Stans' },
    'Glarus': { capital: 'Glarus' },
    'Zug': { capital: 'Zug' },
    'Fribourg': { capital: 'Fribourg' },
    'Solothurn': { capital: 'Solothurn' },
    'Basel-Stadt': { capital: 'Basel' },
    'Basel-Landschaft': { capital: 'Liestal' },
    'Schaffhausen': { capital: 'Schaffhausen' },
    'Appenzell Ausserrhoden': { capital: 'Herisau' },
    'Appenzell Innerrhoden': { capital: 'Appenzell' },
    'St. Gallen': { capital: 'St. Gallen' },
    'Graubünden': { capital: 'Chur', french: 'Grisons' },
    'Aargau': { capital: 'Aarau' },
    'Thurgau': { capital: 'Frauenfeld' },
    'Ticino': { capital: 'Bellinzona' },
    'Vaud': { capital: 'Lausanne' },
    'Valais': { capital: 'Sion' },
    'Neuchâtel': { capital: 'Neuchâtel' },
    'Geneva': { capital: 'Geneva', french: 'Genève' },
    'Jura': { capital: 'Delémont' }
  },

  worldCapitals: {
    'France': 'Paris',
    'Germany': 'Berlin',
    'Italy': 'Rome',
    'Austria': 'Vienna',
    'Spain': 'Madrid',
    'United Kingdom': 'London',
    'Portugal': 'Lisbon',
    'Netherlands': 'Amsterdam',
    'Belgium': 'Brussels',
    'Switzerland': 'Bern',
    'Poland': 'Warsaw',
    'Sweden': 'Stockholm',
    'Norway': 'Oslo',
    'Denmark': 'Copenhagen',
    'Finland': 'Helsinki',
    'Greece': 'Athens',
    'Russia': 'Moscow',
    'China': 'Beijing',
    'Japan': 'Tokyo',
    'India': 'New Delhi',
    'Australia': 'Canberra',
    'Canada': 'Ottawa',
    'United States': 'Washington, D.C.',
    'Brazil': 'Brasília',
    'Argentina': 'Buenos Aires',
    'Egypt': 'Cairo',
    'South Africa': 'Pretoria',
    'Kenya': 'Nairobi',
    'Nigeria': 'Abuja',
    'Mexico': 'Mexico City'
  },

  swissGeography: {
    highestPeak: 'Dufourspitze',
    largestLake: 'Lake Geneva',
    longestRiver: 'Rhine',
    languages: ['German', 'French', 'Italian', 'Romansh'],
    cities: {
      'Zurich': { canton: 'Zurich', largest: true },
      'Geneva': { canton: 'Geneva' },
      'Basel': { canton: 'Basel-Stadt' },
      'Lausanne': { canton: 'Vaud' },
      'Bern': { canton: 'Bern', capital: true },
      'Lucerne': { canton: 'Lucerne' }
    },
    mountains: {
      'Matterhorn': { height: 4478, canton: 'Valais' },
      'Dufourspitze': { height: 4634, canton: 'Valais', highest: true },
      'Jungfrau': { height: 4158, canton: 'Bern' },
      'Eiger': { height: 3970, canton: 'Bern' }
    },
    lakes: {
      'Lake Geneva': { size: 580, largest: true },
      'Lake Constance': { size: 536 },
      'Lake Neuchâtel': { size: 218 },
      'Lake Maggiore': { size: 212 },
      'Lake Zurich': { size: 88 }
    },
    rivers: {
      'Rhine': { longest: true },
      'Aare': {},
      'Rhône': {},
      'Reuss': {}
    }
  },

  continents: {
    'Africa': { largest: 'Sahara Desert', countries: ['Egypt', 'Kenya', 'South Africa', 'Nigeria'] },
    'Asia': { largest: true, countries: ['China', 'Japan', 'India'] },
    'Europe': { countries: ['France', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'Switzerland'] },
    'North America': { countries: ['United States', 'Canada', 'Mexico'] },
    'South America': { countries: ['Brazil', 'Argentina'] },
    'Australia': { continent: true, country: true },
    'Antarctica': { coldest: true }
  },

  oceans: ['Pacific', 'Atlantic', 'Indian', 'Arctic', 'Southern'],

  worldGeography: {
    mountains: {
      'Mount Everest': { location: 'Nepal/Tibet', highest: true },
      'K2': { location: 'Pakistan/China' },
      'Alps': { location: 'Europe' }
    },
    rivers: {
      'Nile': { location: 'Africa', longest: true },
      'Amazon': { location: 'South America' },
      'Yangtze': { location: 'China' }
    },
    deserts: {
      'Sahara': { location: 'Africa', largest: true },
      'Arabian': { location: 'Middle East' },
      'Gobi': { location: 'Asia' }
    }
  }
};

function validateGeographyQuestion(question, answers, correctAnswer, grade, difficulty) {
  const issues = [];
  const questionLower = question.toLowerCase();

  // Parse answers array
  let answersList = [];
  try {
    answersList = typeof answers === 'string' ? JSON.parse(answers) : answers;
  } catch (e) {
    issues.push('Invalid answers format');
    return { valid: false, issues };
  }

  // Validate Swiss canton capitals
  if (questionLower.includes('capital') && questionLower.includes('canton')) {
    for (const [canton, info] of Object.entries(geographyFacts.swissCantons)) {
      if (questionLower.includes(canton.toLowerCase())) {
        if (correctAnswer !== info.capital) {
          issues.push(`Incorrect capital: ${correctAnswer} should be ${info.capital} for canton ${canton}`);
        }
      }
    }
  }

  // Validate world capitals
  if (questionLower.includes('capital')) {
    for (const [country, capital] of Object.entries(geographyFacts.worldCapitals)) {
      if (questionLower.includes(country.toLowerCase())) {
        if (correctAnswer !== capital) {
          issues.push(`Incorrect capital: ${correctAnswer} should be ${capital} for ${country}`);
        }
      }
    }
  }

  // Validate Swiss highest peak
  if (questionLower.includes('highest') && (questionLower.includes('mountain') || questionLower.includes('peak')) && questionLower.includes('switz')) {
    if (!correctAnswer.includes('Dufourspitze') && !correctAnswer.includes('Monte Rosa')) {
      issues.push(`Incorrect highest peak: ${correctAnswer} should be Dufourspitze`);
    }
  }

  // Validate Swiss largest lake
  if (questionLower.includes('largest') && questionLower.includes('lake') && questionLower.includes('switz')) {
    if (!correctAnswer.includes('Geneva') && !correctAnswer.includes('Léman')) {
      issues.push(`Incorrect largest lake: ${correctAnswer} should be Lake Geneva`);
    }
  }

  // Validate Swiss longest river
  if (questionLower.includes('longest') && questionLower.includes('river') && questionLower.includes('switz')) {
    if (!correctAnswer.includes('Rhine')) {
      issues.push(`Incorrect longest river: ${correctAnswer} should be Rhine`);
    }
  }

  // Validate Swiss languages
  if (questionLower.includes('official language') && questionLower.includes('switz')) {
    const validLanguages = ['German', 'French', 'Italian', 'Romansh'];
    if (!validLanguages.some(lang => correctAnswer.includes(lang))) {
      issues.push(`Invalid Swiss language: ${correctAnswer}`);
    }
  }

  // Validate Swiss capital city
  if (questionLower.includes('capital') && questionLower.includes('switzerland')) {
    if (correctAnswer !== 'Bern') {
      issues.push(`Incorrect Swiss capital: ${correctAnswer} should be Bern`);
    }
  }

  // Validate continents count
  if (questionLower.includes('how many continents')) {
    if (correctAnswer !== '7' && correctAnswer !== 'seven') {
      issues.push(`Incorrect continent count: ${correctAnswer} should be 7`);
    }
  }

  // Validate oceans
  if (questionLower.includes('ocean')) {
    const validOceans = geographyFacts.oceans;
    if (questionLower.includes('largest')) {
      if (!correctAnswer.includes('Pacific')) {
        issues.push(`Incorrect largest ocean: ${correctAnswer} should be Pacific`);
      }
    }
  }

  // Validate Mount Everest
  if (questionLower.includes('highest') && questionLower.includes('mountain') && questionLower.includes('world')) {
    if (!correctAnswer.includes('Everest')) {
      issues.push(`Incorrect highest mountain: ${correctAnswer} should be Mount Everest`);
    }
  }

  // Validate Nile as longest river
  if (questionLower.includes('longest') && questionLower.includes('river') && questionLower.includes('world')) {
    if (!correctAnswer.includes('Nile')) {
      issues.push(`Incorrect longest river: ${correctAnswer} should be Nile`);
    }
  }

  // Validate Sahara as largest desert
  if (questionLower.includes('largest') && questionLower.includes('desert')) {
    if (!correctAnswer.includes('Sahara')) {
      issues.push(`Incorrect largest desert: ${correctAnswer} should be Sahara`);
    }
  }

  // Validate that correct answer is in the answers list
  if (!answersList.includes(correctAnswer)) {
    issues.push(`Correct answer "${correctAnswer}" not found in answers list`);
  }

  // Validate wrong answers are actually wrong
  const wrongAnswers = answersList.filter(a => a !== correctAnswer);

  // Check for duplicate answers
  const uniqueAnswers = new Set(answersList);
  if (uniqueAnswers.size !== answersList.length) {
    issues.push('Duplicate answers found');
  }

  return { valid: issues.length === 0, issues };
}

async function validateEnglishGeographyQuestions() {
  console.log('Starting validation of English geography questions...\n');

  try {
    // Query 100 random English geography questions
    const result = await pool.query(`
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'en' AND subject = 'geography'
      ORDER BY RANDOM()
      LIMIT 100
    `);

    console.log(`Found ${result.rows.length} English geography questions\n`);

    const results = {
      totalQuestions: result.rows.length,
      passed: 0,
      failed: 0,
      timestamp: new Date().toISOString(),
      questions: []
    };

    const failedIds = [];

    for (const row of result.rows) {
      const validation = validateGeographyQuestion(
        row.question,
        row.answers,
        row.correct_answer,
        row.grade,
        row.difficulty
      );

      const questionResult = {
        id: row.id,
        question: row.question,
        answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
        correctAnswer: row.correct_answer,
        grade: row.grade,
        difficulty: row.difficulty,
        status: validation.valid ? 'PASS' : 'FAIL',
        issues: validation.issues
      };

      results.questions.push(questionResult);

      if (validation.valid) {
        results.passed++;
        console.log(`✓ PASS: ${row.question.substring(0, 60)}...`);
      } else {
        results.failed++;
        failedIds.push(row.id);
        console.log(`✗ FAIL: ${row.question.substring(0, 60)}...`);
        console.log(`  Issues: ${validation.issues.join(', ')}`);
      }
    }

    // Update failed questions in database
    if (failedIds.length > 0) {
      console.log(`\nUpdating ${failedIds.length} failed questions in database...`);

      for (const id of failedIds) {
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [id]
        );
      }

      console.log('Database updated successfully');
    }

    // Write results to file
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-en-geography.json',
      JSON.stringify(results, null, 2)
    );

    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions: ${results.totalQuestions}`);
    console.log(`Passed: ${results.passed} (${(results.passed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`Failed: ${results.failed} (${(results.failed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log('='.repeat(60));
    console.log(`\nResults written to: qc-results-en-geography.json`);

  } catch (error) {
    console.error('Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

validateEnglishGeographyQuestions();
