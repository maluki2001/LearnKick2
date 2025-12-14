const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function importQuestions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Read the JSON file
    const filePath = path.join(__dirname, 'fr-mc-balance2.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(fileContent);

    console.log(`📦 Found ${questions.length} questions to import`);

    let successCount = 0;
    let errorCount = 0;

    // Get subject IDs from database
    const subjectMapping = {};
    const subjectsResult = await pool.query('SELECT id, name FROM subjects');
    subjectsResult.rows.forEach(s => {
      const nameLower = s.name.toLowerCase();
      if (nameLower.includes('math')) subjectMapping['math'] = s.id;
      if (nameLower.includes('french')) subjectMapping['french'] = s.id;
      if (nameLower.includes('science')) subjectMapping['science'] = s.id;
      if (nameLower.includes('geography')) subjectMapping['geography'] = s.id;
    });

    console.log('📖 Subject mapping:', subjectMapping);

    for (const q of questions) {
      try {
        const result = await pool.query(
          `INSERT INTO questions (
            question,
            answers,
            correct_index,
            correct_answer,
            subject,
            grade,
            difficulty,
            language,
            explanation,
            type,
            validation_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            q.question,
            q.options, // PostgreSQL array
            q.correctAnswer,
            q.options[q.correctAnswer], // Store the actual answer text
            q.subject,
            q.grade,
            // Convert difficulty string to number (easy=1, medium=3, hard=5)
            q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 3 : 5,
            q.language,
            q.explanation,
            q.type,
            'approved'
          ]
        );
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Imported ${successCount} questions...`);
        }
      } catch (err) {
        console.error(`❌ Error importing question: ${q.question.substring(0, 50)}...`);
        console.error(`   ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total attempted: ${questions.length}`);

    // Verify the import by counting questions in database
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM questions WHERE language = 'fr' AND type = 'multiple-choice'`
    );
    console.log(`\n🔢 Total French multiple-choice questions in database: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await pool.end();
  }
}

importQuestions();
