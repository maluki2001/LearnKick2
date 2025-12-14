const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importQuestions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read both JSON files
    const mainQuestionsPath = path.join(__dirname, 'en-tf-balance.json');
    const additionalQuestionsPath = path.join(__dirname, 'en-tf-additional.json');

    const mainQuestions = JSON.parse(fs.readFileSync(mainQuestionsPath, 'utf8'));
    let additionalQuestions = JSON.parse(fs.readFileSync(additionalQuestionsPath, 'utf8'));

    // Fix the problematic questions in additional set
    additionalQuestions = [
      {
        "type": "true-false",
        "language": "en",
        "grade": 3,
        "subject": "math",
        "question": "20 - 8 equals 12",
        "correct_answer": "True",
        "explanation": "When you subtract 8 from 20, you get 12.",
        "difficulty": 3
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 4,
        "subject": "geography",
        "question": "The Atlantic Ocean separates Europe and North America",
        "correct_answer": "True",
        "explanation": "The Atlantic Ocean lies between Europe and North America.",
        "difficulty": 4
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 1,
        "subject": "math",
        "question": "9 - 3 equals 7",
        "correct_answer": "False",
        "explanation": "9 - 3 equals 6, not 7.",
        "difficulty": 1
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 2,
        "subject": "science",
        "question": "The sun is the smallest star in the universe",
        "correct_answer": "False",
        "explanation": "The sun is an average-sized star. There are much larger and much smaller stars.",
        "difficulty": 2
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 3,
        "subject": "english",
        "question": "The word 'beautiful' has four syllables",
        "correct_answer": "False",
        "explanation": "Beautiful has three syllables: beau-ti-ful.",
        "difficulty": 3
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 4,
        "subject": "math",
        "question": "6 × 7 equals 48",
        "correct_answer": "False",
        "explanation": "6 × 7 equals 42, not 48.",
        "difficulty": 4
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 5,
        "subject": "science",
        "question": "Oil is denser than water",
        "correct_answer": "False",
        "explanation": "Water is denser than most oils. That's why oil floats on water.",
        "difficulty": 5
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 6,
        "subject": "geography",
        "question": "The Sahara Desert is located in Asia",
        "correct_answer": "False",
        "explanation": "The Sahara Desert is in Africa, not Asia.",
        "difficulty": 5
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 2,
        "subject": "math",
        "question": "4 + 7 equals 13",
        "correct_answer": "False",
        "explanation": "4 + 7 equals 11, not 13.",
        "difficulty": 2
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 3,
        "subject": "geography",
        "question": "The Arctic Ocean is the warmest ocean",
        "correct_answer": "False",
        "explanation": "The Arctic Ocean is the coldest ocean, covered with ice year-round.",
        "difficulty": 3
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 1,
        "subject": "english",
        "question": "The letter Z comes before A in the alphabet",
        "correct_answer": "False",
        "explanation": "A is the first letter of the alphabet, Z is the last.",
        "difficulty": 1
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 4,
        "subject": "science",
        "question": "Snakes have legs",
        "correct_answer": "False",
        "explanation": "Snakes are reptiles without legs. They slither on their bellies.",
        "difficulty": 4
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 5,
        "subject": "english",
        "question": "The word 'its' with an apostrophe means belonging to it",
        "correct_answer": "False",
        "explanation": "'Its' without an apostrophe means belonging. 'It's' with an apostrophe means 'it is'.",
        "difficulty": 5
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 6,
        "subject": "math",
        "question": "A straight angle measures 360 degrees",
        "correct_answer": "False",
        "explanation": "A straight angle measures 180 degrees. A full rotation is 360 degrees.",
        "difficulty": 5
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 3,
        "subject": "science",
        "question": "Crocodiles are amphibians",
        "correct_answer": "False",
        "explanation": "Crocodiles are reptiles, not amphibians.",
        "difficulty": 3
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 2,
        "subject": "geography",
        "question": "Deserts are always hot",
        "correct_answer": "False",
        "explanation": "Some deserts, like the Gobi Desert, can be very cold. Deserts are defined by low rainfall, not temperature.",
        "difficulty": 2
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 5,
        "subject": "math",
        "question": "1/2 is smaller than 1/3",
        "correct_answer": "False",
        "explanation": "1/2 (0.5) is larger than 1/3 (0.33...).",
        "difficulty": 5
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 4,
        "subject": "english",
        "question": "The word 'receive' is spelled with 'ie' not 'ei'",
        "correct_answer": "False",
        "explanation": "'Receive' is spelled with 'ei' following the rule 'i before e except after c'.",
        "difficulty": 4
      },
      {
        "type": "true-false",
        "language": "en",
        "grade": 6,
        "subject": "science",
        "question": "Sound can travel through a vacuum",
        "correct_answer": "False",
        "explanation": "Sound needs a medium (like air, water, or solids) to travel. It cannot travel through a vacuum.",
        "difficulty": 5
      }
    ];

    // Merge the questions
    const allQuestions = [...mainQuestions, ...additionalQuestions];

    console.log(`Total questions to import: ${allQuestions.length}`);

    // Count True/False balance
    const trueCount = allQuestions.filter(q => q.correct_answer === 'True').length;
    const falseCount = allQuestions.filter(q => q.correct_answer === 'False').length;
    console.log(`True answers: ${trueCount}, False answers: ${falseCount}`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const q of allQuestions) {
      try {
        const query = `
          INSERT INTO questions (
            type,
            language,
            grade,
            subject,
            question,
            correct_answer,
            explanation,
            difficulty,
            validation_status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        `;

        const values = [
          q.type,
          q.language,
          q.grade,
          q.subject,
          q.question,
          q.correct_answer,
          q.explanation,
          q.difficulty,
          'approved'
        ];

        await client.query(query, values);
        successCount++;

        if (successCount % 25 === 0) {
          console.log(`Imported ${successCount} questions...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          question: q.question.substring(0, 50) + '...',
          error: error.message
        });
      }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Successfully imported: ${successCount} questions`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\nError details:');
      errors.slice(0, 10).forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.question}`);
        console.log(`   Error: ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`... and ${errors.length - 10} more errors`);
      }
    }

    // Final verification
    const countQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN correct_answer = 'True' THEN 1 ELSE 0 END) as true_count,
        SUM(CASE WHEN correct_answer = 'False' THEN 1 ELSE 0 END) as false_count
      FROM questions
      WHERE type = 'true-false'
        AND language = 'en'
        AND validation_status = 'approved'
    `;

    const result = await client.query(countQuery);
    console.log('\n=== Final Database Status ===');
    console.log(`Total English true-false questions: ${result.rows[0].total}`);
    console.log(`True answers: ${result.rows[0].true_count}`);
    console.log(`False answers: ${result.rows[0].false_count}`);

  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the import
importQuestions()
  .then(() => {
    console.log('\nImport script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport script failed:', error);
    process.exit(1);
  });
