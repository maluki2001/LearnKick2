const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixFalseFlags() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // These were incorrectly flagged - all are actually correct
    const falseFlags = [
      '0213d5d9-0a48-4a14-95cc-d021d55b2fa4', // Säntis is highest in Eastern Switzerland
      '081b1268-0f44-45cc-a593-4656ddb0a303', // 3 Urkantone (original cantons)
      '1f8656cd-9c75-4a9d-ba8d-38567daf24be', // Vienna closest foreign capital
      '2f5dfc18-39cf-46ce-b9a2-97516aa0be17', // Bern became capital in 1848
      '44408d07-04ae-4708-96cd-8b25a4a8f2aa', // Neuenburgersee is largest ENTIRELY in Switzerland
      '472ab405-c15d-4786-bdf3-30e5f4103934'  // Three founding cantons
    ];

    for (const id of falseFlags) {
      await pool.query(`
        UPDATE questions
        SET validation_status = 'approved',
            quality_score = 95,
            flagged_reason = NULL
        WHERE id = $1
      `, [id]);
    }

    console.log(`Fixed ${falseFlags.length} false flags - all marked as approved with quality_score 95`);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

fixFalseFlags();
