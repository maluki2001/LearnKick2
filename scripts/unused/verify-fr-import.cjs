const { Pool } = require('pg');

async function verifyImport() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Count by subject
    const subjectCount = await pool.query(`
      SELECT subject, COUNT(*) as count
      FROM questions
      WHERE language = 'fr' AND type = 'multiple-choice'
      GROUP BY subject
      ORDER BY count DESC
    `);

    console.log('\n📊 French Multiple-Choice Questions by Subject:');
    let total = 0;
    subjectCount.rows.forEach(r => {
      console.log(`  ${r.subject.padEnd(15)} : ${r.count}`);
      total += parseInt(r.count);
    });
    console.log(`  ${'TOTAL'.padEnd(15)} : ${total}`);

    // Count by grade
    const gradeCount = await pool.query(`
      SELECT grade, COUNT(*) as count
      FROM questions
      WHERE language = 'fr' AND type = 'multiple-choice'
      GROUP BY grade
      ORDER BY grade
    `);

    console.log('\n📊 French Multiple-Choice Questions by Grade:');
    gradeCount.rows.forEach(r => {
      console.log(`  Grade ${r.grade}: ${r.count}`);
    });

    // Count by difficulty
    const difficultyCount = await pool.query(`
      SELECT difficulty, COUNT(*) as count
      FROM questions
      WHERE language = 'fr' AND type = 'multiple-choice'
      GROUP BY difficulty
      ORDER BY difficulty
    `);

    console.log('\n📊 French Multiple-Choice Questions by Difficulty:');
    difficultyCount.rows.forEach(r => {
      const label = r.difficulty === 1 ? 'Easy' : r.difficulty === 3 ? 'Medium' : 'Hard';
      console.log(`  ${label} (${r.difficulty}): ${r.count}`);
    });

    // Sample a few questions from the new batch
    const samples = await pool.query(`
      SELECT question, subject, grade, difficulty, answers[1] as first_option
      FROM questions
      WHERE language = 'fr' AND type = 'multiple-choice'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n📝 Sample of Recently Added Questions:');
    samples.rows.forEach((s, idx) => {
      console.log(`\n  ${idx + 1}. [${s.subject}, Grade ${s.grade}, Diff ${s.difficulty}]`);
      console.log(`     ${s.question.substring(0, 60)}...`);
      console.log(`     First option: ${s.first_option}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyImport();
