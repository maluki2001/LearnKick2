const { Client } = require('pg');
const fs = require('fs');

async function importQuestions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const questions = JSON.parse(
      fs.readFileSync('/Users/arisejupi/Desktop/LearnKick-LeanMVP/de-tf-balance.json', 'utf8')
    );

    console.log(`📊 Total questions to import: ${questions.length}`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    const wahrCount = questions.filter(q => q.correct_answer === 'Wahr').length;
    const falschCount = questions.filter(q => q.correct_answer === 'Falsch').length;

    console.log(`\n🎯 Distribution:`);
    console.log(`   - Wahr: ${wahrCount}`);
    console.log(`   - Falsch: ${falschCount}`);
    console.log('');

    for (const q of questions) {
      try {
        // Check for duplicates
        const checkQuery = `
          SELECT id FROM questions
          WHERE language = $1
          AND question = $2
          LIMIT 1
        `;
        const existing = await client.query(checkQuery, [q.language, q.question]);

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipped duplicate: "${q.question.substring(0, 50)}..."`);
          skipped++;
          continue;
        }

        // Generate UUID (PostgreSQL requires proper UUID format)
        const { randomUUID } = require('crypto');
        const id = randomUUID();

        // Insert question
        const insertQuery = `
          INSERT INTO questions (
            id, type, language, grade, subject,
            question, answers, correct_answer,
            explanation, difficulty, lehrplan21_code,
            competency_level, time_limit, tags,
            validation_status, created_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8,
            $9, $10, $11,
            $12, $13, $14,
            $15, NOW()
          )
        `;

        const answers = ['Wahr', 'Falsch'];
        const tags = [q.subject, 'true-false', `grade-${q.grade}`];

        await client.query(insertQuery, [
          id,
          q.type,
          q.language,
          q.grade,
          q.subject,
          q.question,
          answers, // Pass array directly, not JSON.stringify
          q.correct_answer,
          q.explanation,
          q.difficulty,
          q.lehrplan21_code,
          q.difficulty,
          18000, // 3 minutes
          tags, // Pass array directly, not JSON.stringify
          'approved'
        ]);

        imported++;
        if (imported % 20 === 0) {
          console.log(`✅ Imported ${imported} questions...`);
        }

      } catch (err) {
        console.error(`❌ Error importing question: ${err.message}`);
        errors++;
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${imported}`);
    console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total processed: ${questions.length}`);

    // Verify distribution in database
    const verifyQuery = `
      SELECT
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
      AND language = 'de'
      AND created_at > NOW() - INTERVAL '5 minutes'
      GROUP BY correct_answer
      ORDER BY correct_answer
    `;

    const verification = await client.query(verifyQuery);
    console.log(`\n✅ Database Verification (last 5 minutes):`);
    verification.rows.forEach(row => {
      console.log(`   - ${row.correct_answer}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

importQuestions().catch(console.error);
