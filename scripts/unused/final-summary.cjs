const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getFinalSummary() {
  const client = await pool.connect();

  try {
    console.log('📊 GERMAN QUESTION VALIDATION - FINAL SUMMARY\n');
    console.log('='.repeat(80));

    // Get validation status counts
    const statusResult = await client.query(`
      SELECT validation_status, COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'german'
      GROUP BY validation_status
      ORDER BY count DESC
    `);

    console.log('\nValidation Status Distribution:');
    let total = 0;
    statusResult.rows.forEach(row => {
      total += parseInt(row.count);
      console.log(`  ${row.validation_status || 'NULL'}: ${row.count} questions`);
    });
    console.log(`  TOTAL: ${total} questions\n`);

    // Get rejection reasons summary
    const rejectedResult = await client.query(`
      SELECT qc_agent_report->'errors' as errors
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'rejected'
        AND qc_agent_report IS NOT NULL
      LIMIT 100
    `);

    const errorCounts = {};
    rejectedResult.rows.forEach(row => {
      if (row.errors && Array.isArray(row.errors)) {
        row.errors.forEach(error => {
          errorCounts[error] = (errorCounts[error] || 0) + 1;
        });
      }
    });

    console.log('='.repeat(80));
    console.log('TOP REJECTION REASONS (from 100 sampled rejected questions):\n');

    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([error, count]) => {
        console.log(`  ${count}x - ${error}`);
      });

    // Get quality score distribution for approved questions
    const qualityResult = await client.query(`
      SELECT quality_score, COUNT(*) as count
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'approved'
      GROUP BY quality_score
      ORDER BY quality_score DESC
    `);

    console.log('\n' + '='.repeat(80));
    console.log('QUALITY SCORE DISTRIBUTION (Approved Questions):\n');

    qualityResult.rows.forEach(row => {
      console.log(`  Score ${row.quality_score}: ${row.count} questions`);
    });

    // Calculate approval rate
    const approvedCount = statusResult.rows.find(r => r.validation_status === 'approved')?.count || 0;
    const rejectedCount = statusResult.rows.find(r => r.validation_status === 'rejected')?.count || 0;
    const validatedTotal = approvedCount + rejectedCount;
    const approvalRate = validatedTotal > 0 ? ((approvedCount / validatedTotal) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION METRICS:\n');
    console.log(`  Approved: ${approvedCount} questions`);
    console.log(`  Rejected: ${rejectedCount} questions`);
    console.log(`  Approval Rate: ${approvalRate}%`);
    console.log(`  Pending (qc_passed): ${statusResult.rows.find(r => r.validation_status === 'qc_passed')?.count || 0} questions`);

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

getFinalSummary();
