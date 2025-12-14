const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function finalVerification() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              FINAL NMG VALIDATION VERIFICATION                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const statusCheck = await pool.query(`
      SELECT validation_status, COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'nmg'
      GROUP BY validation_status
    `);

    console.log('Status Breakdown:');
    statusCheck.rows.forEach(row => {
      console.log(`  ${row.validation_status.padEnd(20)}: ${row.count}`);
    });

    const qualityCheck = await pool.query(`
      SELECT COUNT(*) as total
      FROM questions
      WHERE language = 'de' AND subject = 'nmg'
        AND validation_status = 'approved'
        AND quality_score = 95
    `);

    console.log(`\nApproved with quality_score 95: ${qualityCheck.rows[0].total}`);

    const totalCheck = await pool.query(`
      SELECT COUNT(*) as total FROM questions WHERE language = 'de' AND subject = 'nmg'
    `);

    const approvalRate = (qualityCheck.rows[0].total / totalCheck.rows[0].total * 100).toFixed(2);

    console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  Total: ${totalCheck.rows[0].total}  |  Approved: ${qualityCheck.rows[0].total}  |  Rate: ${approvalRate}%     ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
    console.log('✓ NMG validation complete!\n');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

finalVerification();
