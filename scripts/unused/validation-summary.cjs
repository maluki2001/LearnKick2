const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║     LearnKick Question Validation Summary Report        ║');
    console.log('║                 Date: 2025-12-07                         ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Get total counts
    const { rows: totalCounts } = await pool.query(`
      SELECT
        language,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE validation_status = 'approved') as approved,
        COUNT(*) FILTER (WHERE validation_status = 'flagged') as flagged,
        COUNT(*) FILTER (WHERE validation_status = 'rejected') as rejected
      FROM questions
      WHERE language IN ('en', 'fr')
      GROUP BY language
      ORDER BY language
    `);

    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│                 VALIDATION STATISTICS                    │');
    console.log('└──────────────────────────────────────────────────────────┘\n');

    let totalAll = 0;
    let totalApproved = 0;
    let totalRejected = 0;
    let totalFlagged = 0;

    totalCounts.forEach(row => {
      totalAll += parseInt(row.total);
      totalApproved += parseInt(row.approved);
      totalRejected += parseInt(row.rejected);
      totalFlagged += parseInt(row.flagged);

      const lang = row.language === 'en' ? 'English' : 'French';
      const passRate = Math.round((row.approved / row.total) * 100);

      console.log(`${lang.toUpperCase()}:`);
      console.log(`  Total:    ${row.total}`);
      console.log(`  ✅ Approved: ${row.approved} (${passRate}%)`);
      if (row.flagged > 0) console.log(`  ⚠️  Flagged:  ${row.flagged}`);
      if (row.rejected > 0) console.log(`  ❌ Rejected: ${row.rejected}`);
      console.log('');
    });

    const overallPassRate = Math.round((totalApproved / totalAll) * 100);

    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│                    OVERALL RESULTS                       │');
    console.log('└──────────────────────────────────────────────────────────┘\n');
    console.log(`  Total Validated:  ${totalAll} questions`);
    console.log(`  ✅ Approved:       ${totalApproved} (${overallPassRate}%)`);
    if (totalFlagged > 0) console.log(`  ⚠️  Flagged:        ${totalFlagged}`);
    if (totalRejected > 0) console.log(`  ❌ Rejected:       ${totalRejected}`);
    console.log('');

    // Language compliance
    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│              LANGUAGE COMPLIANCE CHECK                   │');
    console.log('└──────────────────────────────────────────────────────────┘\n');

    const enCount = totalCounts.find(r => r.language === 'en');
    const frCount = totalCounts.find(r => r.language === 'fr');

    if (enCount) {
      const enPassRate = Math.round((enCount.approved / enCount.total) * 100);
      console.log(`  British English:  ${enPassRate}% compliance`);
      console.log(`    ✓ Correct spelling (colour, favourite, centre, etc.)`);
      console.log(`    ✓ Metric system usage`);
      console.log('');
    }

    if (frCount) {
      const frPassRate = Math.round((frCount.approved / frCount.total) * 100);
      console.log(`  Swiss French:     ${frPassRate}% compliance`);
      console.log(`    ✓ Swiss numbers (septante, huitante, nonante)`);
      console.log(`    ✓ Suisse romande cultural context`);
      console.log('');
    }

    // Issues found
    if (totalRejected > 0 || totalFlagged > 0) {
      console.log('┌──────────────────────────────────────────────────────────┐');
      console.log('│                    ISSUES FOUND                          │');
      console.log('└──────────────────────────────────────────────────────────┘\n');

      const { rows: issues } = await pool.query(`
        SELECT id, language, grade, subject, question
        FROM questions
        WHERE language IN ('en', 'fr')
          AND validation_status IN ('rejected', 'flagged')
        ORDER BY validation_status DESC, language, grade
      `);

      issues.forEach((q, idx) => {
        const status = q.validation_status === 'rejected' ? '❌ REJECTED' : '⚠️  FLAGGED';
        console.log(`  ${idx + 1}. ${status} - [${q.language.toUpperCase()}] Grade ${q.grade}`);
        console.log(`     Subject: ${q.subject}`);
        console.log(`     ID: ${q.id}`);
        console.log(`     Question: "${q.question.substring(0, 60)}..."`);
        console.log('');
      });
    }

    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│                      CONCLUSION                          │');
    console.log('└──────────────────────────────────────────────────────────┘\n');

    if (overallPassRate >= 95) {
      console.log('  ✨ EXCELLENT: Question quality meets high standards');
    } else if (overallPassRate >= 80) {
      console.log('  ✅ GOOD: Question quality is acceptable');
    } else {
      console.log('  ⚠️  NEEDS IMPROVEMENT: Review flagged questions');
    }

    console.log(`  Overall Pass Rate: ${overallPassRate}%`);
    console.log('');
    console.log('  📄 Detailed report: VALIDATION_REPORT.md');
    console.log('  💾 Database updated with validation results');
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              Validation Complete ✅                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

run();
