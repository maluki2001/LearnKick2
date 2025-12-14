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
    'USA': 'Washington, D.C.',
    'Brazil': 'Brasília',
    'Argentina': 'Buenos Aires',
    'Egypt': 'Cairo',
    'South Africa': 'Pretoria',
    'Kenya': 'Nairobi',
    'Nigeria': 'Abuja',
    'Mexico': 'Mexico City',
    'Peru': 'Lima',
    'Estonia': 'Tallinn',
    'Latvia': 'Riga',
    'New Zealand': 'Wellington',
    'Czech Republic': 'Prague',
    'South Korea': 'Seoul',
    'Indonesia': 'Jakarta',
    'Malaysia': 'Kuala Lumpur',
    'Morocco': 'Rabat'
  },

  swissGeography: {
    highestPeak: 'Dufourspitze',
    largestLake: 'Lake Geneva',
    largestLakeEntirely: 'Lake Neuchâtel',
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
      'Matterhorn': { height: 4478, canton: 'Valais', famous: true },
      'Dufourspitze': { height: 4634, canton: 'Valais', highest: true },
      'Jungfrau': { height: 4158, canton: 'Bern' },
      'Eiger': { height: 3970, canton: 'Bern' }
    },
    passes: {
      'Gotthard': { connects: ['Uri', 'Ticino'] },
      'Simplon': { connects: ['Switzerland', 'Italy'] },
      'Great St Bernard': { connects: ['Switzerland', 'Italy'] }
    },
    rivers: {
      'Rhine': { longest: true },
      'Aare': { flows: ['Bern'] },
      'Rhône': {},
      'Reuss': {}
    },
    glaciers: {
      'Aletsch': { longest: true }
    }
  },

  worldGeography: {
    continents: {
      count: 7,
      names: ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Australia', 'Antarctica'],
      mostCountries: 'Africa',
      highestElevation: 'Antarctica'
    },
    oceans: {
      count: 5,
      names: ['Pacific', 'Atlantic', 'Indian', 'Arctic', 'Southern'],
      largest: 'Pacific'
    },
    mountains: {
      'Mount Everest': { location: 'Himalayas', highest: true },
      'Mount Kilimanjaro': { location: 'Tanzania', type: 'volcano' }
    },
    rivers: {
      'Nile': { longest: true },
      'Amazon': { location: 'South America', longest: true },
      'Yangtze': { location: 'Asia', longest: true }
    },
    deserts: {
      'Sahara': { largest: true, location: 'Africa' }
    },
    landmarks: {
      'Great Wall': { location: 'China' },
      'Taj Mahal': { location: 'India' },
      'Victoria Falls': { location: 'Zambia/Zimbabwe' },
      'Big Ben': { location: 'London' },
      'Sydney Opera House': { location: 'Sydney' },
      'Petra': { location: 'Jordan' }
    },
    islands: {
      'Greenland': { largest: true }
    },
    mountainRanges: {
      'Andes': { location: 'South America', longest: true },
      'Himalayas': { location: 'Asia', contains: 'Mount Everest' },
      'Alps': { location: 'Europe' }
    }
  }
};

function validateGeographyQuestion(question, answers, correctAnswer, grade, difficulty) {
  const issues = [];
  const questionLower = question.toLowerCase();

  // Check for missing correct answer (data integrity issue)
  if (!correctAnswer || correctAnswer.trim() === '') {
    issues.push('DATA INTEGRITY: Missing correct answer');
    return { valid: false, issues, category: 'data_integrity' };
  }

  // Parse answers array
  let answersList = [];
  try {
    answersList = typeof answers === 'string' ? JSON.parse(answers) : answers;
  } catch (e) {
    issues.push('DATA INTEGRITY: Invalid answers format');
    return { valid: false, issues, category: 'data_integrity' };
  }

  // Validate that correct answer is in the answers list
  if (!answersList.includes(correctAnswer)) {
    issues.push(`DATA INTEGRITY: Correct answer "${correctAnswer}" not found in answers list`);
    return { valid: false, issues, category: 'data_integrity' };
  }

  // Check for duplicate answers
  const uniqueAnswers = new Set(answersList);
  if (uniqueAnswers.size !== answersList.length) {
    issues.push('DATA INTEGRITY: Duplicate answers found');
  }

  // FACTUAL VALIDATION STARTS HERE

  // Validate Swiss canton capitals
  if (questionLower.includes('capital') && questionLower.includes('canton')) {
    for (const [canton, info] of Object.entries(geographyFacts.swissCantons)) {
      if (questionLower.includes(canton.toLowerCase())) {
        if (correctAnswer !== info.capital) {
          issues.push(`FACTUAL ERROR: Incorrect capital - ${correctAnswer} should be ${info.capital} for canton ${canton}`);
        }
      }
    }
  }

  // Validate world capitals
  if (questionLower.includes('capital')) {
    for (const [country, capital] of Object.entries(geographyFacts.worldCapitals)) {
      if (questionLower.includes(country.toLowerCase())) {
        // Handle variations (e.g., "Washington D.C." vs "Washington, D.C.")
        const normalizedCorrect = correctAnswer.replace(/[,\.]/g, '').toLowerCase();
        const normalizedCapital = capital.replace(/[,\.]/g, '').toLowerCase();
        if (normalizedCorrect !== normalizedCapital) {
          issues.push(`FACTUAL ERROR: Incorrect capital - ${correctAnswer} should be ${capital} for ${country}`);
        }
      }
    }
  }

  // Validate Swiss highest peak
  if (questionLower.includes('highest') && (questionLower.includes('mountain') || questionLower.includes('peak')) && questionLower.includes('switz')) {
    if (!correctAnswer.includes('Dufourspitze') && !correctAnswer.includes('Monte Rosa')) {
      issues.push(`FACTUAL ERROR: Incorrect highest peak - ${correctAnswer} should be Dufourspitze/Monte Rosa`);
    }
  }

  // Validate Swiss largest lake
  if (questionLower.includes('largest') && questionLower.includes('lake') && questionLower.includes('switz')) {
    if (questionLower.includes('entirely')) {
      // Lake Neuchâtel is largest entirely within Switzerland
      if (!correctAnswer.includes('Neuchâtel')) {
        issues.push(`FACTUAL ERROR: Incorrect largest lake entirely in Switzerland - ${correctAnswer} should be Lake Neuchâtel`);
      }
    } else {
      // Lake Geneva is largest overall
      if (!correctAnswer.includes('Geneva') && !correctAnswer.includes('Léman')) {
        issues.push(`FACTUAL ERROR: Incorrect largest lake - ${correctAnswer} should be Lake Geneva`);
      }
    }
  }

  // Validate Swiss longest river
  if (questionLower.includes('longest') && questionLower.includes('river') && questionLower.includes('switz')) {
    if (!correctAnswer.includes('Rhine')) {
      issues.push(`FACTUAL ERROR: Incorrect longest river - ${correctAnswer} should be Rhine`);
    }
  }

  // Validate Swiss official languages
  if (questionLower.includes('official language') && questionLower.includes('switz')) {
    const validLanguages = ['German', 'French', 'Italian', 'Romansh'];
    if (questionLower.includes('not')) {
      // Question asks which is NOT an official language
      if (validLanguages.some(lang => correctAnswer.includes(lang))) {
        issues.push(`FACTUAL ERROR: ${correctAnswer} IS an official Swiss language`);
      }
    } else {
      if (!validLanguages.some(lang => correctAnswer.includes(lang))) {
        issues.push(`FACTUAL ERROR: Invalid Swiss language - ${correctAnswer}`);
      }
    }
  }

  // Validate Swiss capital city
  if (questionLower.includes('capital') && (questionLower.includes('switzerland') || questionLower.includes('swiss'))) {
    // Skip if asking about "Olympic Capital" or other specific capitals
    if (!questionLower.includes('olympic')) {
      if (correctAnswer !== 'Bern') {
        issues.push(`FACTUAL ERROR: Incorrect Swiss capital - ${correctAnswer} should be Bern`);
      }
    }
  }

  // Validate continents count
  if (questionLower.includes('how many continents')) {
    if (correctAnswer !== '7' && correctAnswer.toLowerCase() !== 'seven') {
      issues.push(`FACTUAL ERROR: Incorrect continent count - ${correctAnswer} should be 7`);
    }
  }

  // Validate largest ocean
  if (questionLower.includes('largest') && questionLower.includes('ocean')) {
    if (!correctAnswer.includes('Pacific')) {
      issues.push(`FACTUAL ERROR: Incorrect largest ocean - ${correctAnswer} should be Pacific`);
    }
  }

  // Validate Mount Everest
  if (questionLower.includes('highest') && questionLower.includes('mountain') && questionLower.includes('world')) {
    if (!correctAnswer.includes('Everest')) {
      issues.push(`FACTUAL ERROR: Incorrect highest mountain - ${correctAnswer} should be Mount Everest`);
    }
  }

  // Validate longest river (world)
  if (questionLower.includes('longest') && questionLower.includes('river') && !questionLower.includes('switz')) {
    if (questionLower.includes('world')) {
      // For true/false questions, both Nile and Amazon are acceptable
      if (!questionLower.includes('nile') && !questionLower.includes('amazon')) {
        // Multiple choice question
        if (!correctAnswer.includes('Nile') && !correctAnswer.includes('Amazon')) {
          issues.push(`FACTUAL ERROR: Incorrect longest river - ${correctAnswer} should be Nile or Amazon (debated)`);
        }
      }
      // If question specifically asks about Nile or Amazon, accept "True" for both
    }
    if (questionLower.includes('asia')) {
      if (!correctAnswer.includes('Yangtze')) {
        issues.push(`FACTUAL ERROR: Incorrect longest river in Asia - ${correctAnswer} should be Yangtze`);
      }
    }
    if (questionLower.includes('south america')) {
      if (!correctAnswer.includes('Amazon')) {
        issues.push(`FACTUAL ERROR: Incorrect longest river in South America - ${correctAnswer} should be Amazon`);
      }
    }
  }

  // Validate largest desert
  if (questionLower.includes('largest') && questionLower.includes('desert')) {
    // Sahara is largest hot desert; Antarctica is largest desert overall
    if (questionLower.includes('hot desert')) {
      // For true/false questions about Sahara being largest hot desert
      if (questionLower.includes('sahara') && correctAnswer === 'False') {
        issues.push(`FACTUAL ERROR: Sahara IS the largest hot desert - should be True`);
      }
    } else if (!questionLower.includes('hot')) {
      // For multiple choice about largest desert overall
      if (!correctAnswer.includes('Sahara') && !correctAnswer.includes('Antarctica')) {
        issues.push(`FACTUAL ERROR: Incorrect largest desert - ${correctAnswer} (Sahara for hot desert, Antarctica for all deserts)`);
      }
    }
  }

  // Validate Swiss famous mountain
  if (questionLower.includes('famous') && questionLower.includes('mountain') && questionLower.includes('switz')) {
    if (!correctAnswer.includes('Matterhorn')) {
      issues.push(`FACTUAL ERROR: Most famous Swiss mountain - ${correctAnswer} (expected Matterhorn)`);
    }
  }

  // Validate largest island
  if (questionLower.includes('largest') && questionLower.includes('island')) {
    if (!correctAnswer.includes('Greenland')) {
      issues.push(`FACTUAL ERROR: Incorrect largest island - ${correctAnswer} should be Greenland`);
    }
  }

  // Validate true/false questions
  if (answersList.includes('True') && answersList.includes('False')) {
    // Nile longest river
    if (questionLower.includes('nile') && questionLower.includes('longest') && questionLower.includes('river')) {
      if (correctAnswer !== 'True') {
        issues.push(`FACTUAL ERROR: Nile is the longest river - should be True`);
      }
    }
  }

  // Filter out data integrity issues for factual error count
  const factualIssues = issues.filter(i => i.startsWith('FACTUAL ERROR'));
  const dataIssues = issues.filter(i => i.startsWith('DATA INTEGRITY'));

  return {
    valid: issues.length === 0,
    issues,
    category: factualIssues.length > 0 ? 'factual_error' : (dataIssues.length > 0 ? 'data_integrity' : 'pass')
  };
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
      failedFactual: 0,
      failedDataIntegrity: 0,
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
        category: validation.category,
        issues: validation.issues
      };

      results.questions.push(questionResult);

      if (validation.valid) {
        results.passed++;
        console.log(`✓ PASS: ${row.question.substring(0, 70)}...`);
      } else {
        if (validation.category === 'factual_error') {
          results.failedFactual++;
        } else {
          results.failedDataIntegrity++;
        }
        failedIds.push(row.id);
        console.log(`✗ FAIL (${validation.category}): ${row.question.substring(0, 60)}...`);
        validation.issues.forEach(issue => console.log(`  - ${issue}`));
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

    console.log('\n' + '='.repeat(70));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Questions: ${results.totalQuestions}`);
    console.log(`Passed: ${results.passed} (${(results.passed/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`Failed - Factual Errors: ${results.failedFactual} (${(results.failedFactual/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`Failed - Data Integrity: ${results.failedDataIntegrity} (${(results.failedDataIntegrity/results.totalQuestions*100).toFixed(1)}%)`);
    console.log(`Total Failed: ${results.failedFactual + results.failedDataIntegrity} (${((results.failedFactual + results.failedDataIntegrity)/results.totalQuestions*100).toFixed(1)}%)`);
    console.log('='.repeat(70));
    console.log(`\nResults written to: qc-results-en-geography.json`);

  } catch (error) {
    console.error('Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

validateEnglishGeographyQuestions();
