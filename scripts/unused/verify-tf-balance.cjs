const { Client } = require('pg');

async function verifyBalance() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('====== German True-False Question Balance Report ======\n');

    // Overall stats
    const overallQuery = `
      SELECT
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
      AND language = 'de'
      GROUP BY correct_answer
      ORDER BY correct_answer
    `;

    const overall = await client.query(overallQuery);
    console.log('Overall Distribution:');
    overall.rows.forEach(row => {
      console.log(`  ${row.correct_answer}: ${row.count}`);
    });

    const total = overall.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log(`  TOTAL: ${total}\n`);

    // By grade
    const gradeQuery = `
      SELECT
        grade,
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
      AND language = 'de'
      GROUP BY grade, correct_answer
      ORDER BY grade, correct_answer
    `;

    const byGrade = await client.query(gradeQuery);
    console.log('Distribution by Grade:');
    let currentGrade = null;
    byGrade.rows.forEach(row => {
      if (row.grade !== currentGrade) {
        if (currentGrade !== null) console.log('');
        currentGrade = row.grade;
        console.log(`  Grade ${row.grade}:`);
      }
      console.log(`    ${row.correct_answer}: ${row.count}`);
    });

    // By subject
    const subjectQuery = `
      SELECT
        subject,
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
      AND language = 'de'
      GROUP BY subject, correct_answer
      ORDER BY subject, correct_answer
    `;

    const bySubject = await client.query(subjectQuery);
    console.log('\nDistribution by Subject:');
    let currentSubject = null;
    bySubject.rows.forEach(row => {
      if (row.subject !== currentSubject) {
        if (currentSubject !== null) console.log('');
        currentSubject = row.subject;
        console.log(`  ${row.subject}:`);
      }
      console.log(`    ${row.correct_answer}: ${row.count}`);
    });

    // Recently imported (last 10 minutes)
    const recentQuery = `
      SELECT
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
      AND language = 'de'
      AND created_at > NOW() - INTERVAL '10 minutes'
      GROUP BY correct_answer
      ORDER BY correct_answer
    `;

    const recent = await client.query(recentQuery);
    console.log('\nRecently Imported (last 10 minutes):');
    recent.rows.forEach(row => {
      console.log(`  ${row.correct_answer}: ${row.count}`);
    });

    const recentTotal = recent.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log(`  TOTAL: ${recentTotal}\n`);

    console.log('======================================================');

  } finally {
    await client.end();
  }
}

verifyBalance().catch(console.error);
