const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verify() {
  const client = await pool.connect();
  try {
    // Count total German questions
    const totalResult = await client.query(
      "SELECT COUNT(*) FROM questions WHERE language = 'de'"
    );
    console.log('📊 Total German questions in database:', totalResult.rows[0].count);

    // Count by type
    const typeResult = await client.query(
      "SELECT type, COUNT(*) FROM questions WHERE language = 'de' GROUP BY type ORDER BY type"
    );
    console.log('\n📝 German questions by type:');
    typeResult.rows.forEach(row => {
      console.log(`  - ${row.type}: ${row.count}`);
    });

    // Count by subject
    const subjectResult = await client.query(
      "SELECT subject, COUNT(*) FROM questions WHERE language = 'de' GROUP BY subject ORDER BY subject"
    );
    console.log('\n📚 German questions by subject:');
    subjectResult.rows.forEach(row => {
      console.log(`  - ${row.subject}: ${row.count}`);
    });

    // Count by grade
    const gradeResult = await client.query(
      "SELECT grade, COUNT(*) FROM questions WHERE language = 'de' GROUP BY grade ORDER BY grade"
    );
    console.log('\n🎓 German questions by grade:');
    gradeResult.rows.forEach(row => {
      console.log(`  - Grade ${row.grade}: ${row.count}`);
    });

    // Count recent imports (mc-balance2)
    const recentResult = await client.query(
      "SELECT COUNT(*) FROM questions WHERE 'mc-balance2' = ANY(tags)"
    );
    console.log('\n🆕 Questions with mc-balance2 tag:', recentResult.rows[0].count);

    // Sample questions
    const sampleResult = await client.query(
      "SELECT question, subject, grade FROM questions WHERE 'mc-balance2' = ANY(tags) LIMIT 5"
    );
    console.log('\n📋 Sample imported questions:');
    sampleResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. [Grade ${row.grade}, ${row.subject}] ${row.question.substring(0, 60)}...`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(console.error);
