const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function countAnswers() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
        AND validation_status = 'approved'
      GROUP BY correct_answer
      ORDER BY count DESC
    `);

    console.log("=== Database True/False Answer Distribution ===");
    let trueTotal = 0;
    let falseTotal = 0;

    result.rows.forEach(row => {
      const answer = row.correct_answer.toString().toLowerCase();
      const count = parseInt(row.count);

      if (answer === "true" || answer === "wahr" || answer === "vrai" || answer === "0" || answer === "richtig") {
        trueTotal += count;
        console.log(`  '${row.correct_answer}' (TRUE): ${count}`);
      } else if (answer === "false" || answer === "falsch" || answer === "faux" || answer === "1") {
        falseTotal += count;
        console.log(`  '${row.correct_answer}' (FALSE): ${count}`);
      } else {
        console.log(`  '${row.correct_answer}' (OTHER): ${count}`);
      }
    });

    console.log("\n--- Summary ---");
    console.log("Correct answer is TRUE:", trueTotal);
    console.log("Correct answer is FALSE:", falseTotal);
    console.log("Total:", trueTotal + falseTotal);
    if (trueTotal + falseTotal > 0) {
      console.log("TRUE percentage:", ((trueTotal / (trueTotal + falseTotal)) * 100).toFixed(1) + "%");
      console.log("FALSE percentage:", ((falseTotal / (trueTotal + falseTotal)) * 100).toFixed(1) + "%");
    }

    // By language
    const langResult = await client.query(`
      SELECT
        language,
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE type = 'true-false'
        AND validation_status = 'approved'
      GROUP BY language, correct_answer
      ORDER BY language, correct_answer
    `);

    console.log("\n--- By Language ---");
    const byLang = {};
    langResult.rows.forEach(row => {
      if (!byLang[row.language]) {
        byLang[row.language] = { trueCount: 0, falseCount: 0 };
      }
      const answer = row.correct_answer.toString().toLowerCase();
      const count = parseInt(row.count);
      if (answer === "true" || answer === "wahr" || answer === "vrai" || answer === "0" || answer === "richtig") {
        byLang[row.language].trueCount += count;
      } else {
        byLang[row.language].falseCount += count;
      }
    });

    Object.entries(byLang).forEach(([lang, counts]) => {
      const total = counts.trueCount + counts.falseCount;
      const truePct = ((counts.trueCount / total) * 100).toFixed(1);
      const falsePct = ((counts.falseCount / total) * 100).toFixed(1);
      console.log(`${lang.toUpperCase()}: TRUE=${counts.trueCount} (${truePct}%), FALSE=${counts.falseCount} (${falsePct}%)`);
    });

  } finally {
    client.release();
    pool.end();
  }
}

countAnswers().catch(console.error);
