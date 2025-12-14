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

    // Read the JSON file
    const questionsPath = path.join(__dirname, 'en-tf-balance.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    console.log(`Found ${questionsData.length} questions to import`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const q of questionsData) {
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
          'approved' // Set validation_status to approved
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
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.question}`);
        console.log(`   Error: ${err.error}`);
      });
    }

    // Verify the import
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
    console.log('\n=== Database Verification ===');
    console.log(`Total true-false questions in database: ${result.rows[0].total}`);
    console.log(`True answers: ${result.rows[0].true_count}`);
    console.log(`False answers: ${result.rows[0].false_count}`);

    // Show breakdown by grade and subject
    const breakdownQuery = `
      SELECT
        grade,
        subject,
        COUNT(*) as count,
        SUM(CASE WHEN correct_answer = 'True' THEN 1 ELSE 0 END) as true_count,
        SUM(CASE WHEN correct_answer = 'False' THEN 1 ELSE 0 END) as false_count
      FROM questions
      WHERE type = 'true-false'
        AND language = 'en'
        AND validation_status = 'approved'
      GROUP BY grade, subject
      ORDER BY grade, subject
    `;

    const breakdown = await client.query(breakdownQuery);
    console.log('\n=== Breakdown by Grade and Subject ===');
    breakdown.rows.forEach(row => {
      console.log(`Grade ${row.grade} - ${row.subject}: ${row.count} total (${row.true_count} True, ${row.false_count} False)`);
    });

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
