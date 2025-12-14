#!/usr/bin/env node

const { Pool } = require('pg');

async function getFinalCount() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Get exact count of newly imported multiple-choice questions
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM questions
      WHERE language = 'fr'
        AND type = 'multiple-choice'
        AND created_at > NOW() - INTERVAL '10 minutes'
    `);

    const newCount = result.rows[0].count;

    // Get total French question count
    const total = await pool.query(`
      SELECT COUNT(*) as count FROM questions WHERE language = 'fr'
    `);

    // Get breakdown by type
    const byType = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM questions
      WHERE language = 'fr'
      GROUP BY type
      ORDER BY type
    `);

    console.log('📊 FINAL IMPORT REPORT\n');
    console.log(`✅ Newly imported multiple-choice questions: ${newCount}`);
    console.log(`🇫🇷 Total French questions in database: ${total.rows[0].count}\n`);

    console.log('📚 Breakdown by type:');
    byType.rows.forEach(row => {
      console.log(`   ${row.type}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Query failed:', error);
  } finally {
    await pool.end();
  }
}

getFinalCount();
