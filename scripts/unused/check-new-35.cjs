#!/usr/bin/env node

const { Pool } = require('pg');

async function checkNew35() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check for questions matching our unique topics
    const romanNumerals = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND question LIKE '%romain%'
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const negativeNumbers = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%-5 + 8%' OR question LIKE '%plus petit que -2%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const idioms = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%poser un lapin%' OR question LIKE '%avoir le cafard%' OR question LIKE '%mettre la main%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const magnets = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%aimant%' OR question LIKE '%pôle%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const electricity = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%électric%' OR question LIKE '%circuit%' OR question LIKE '%cuivre%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const simpleMachines = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%poulie%' OR question LIKE '%rampe%' OR question LIKE '%planche inclinée%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const weather = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%baromètre%' OR question LIKE '%nimbus%' OR question LIKE '%thermomètre%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const timezones = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%fuseau%' OR question LIKE '%New York%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const mountains = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%Pyrénées%' OR question LIKE '%Himalaya%' OR question LIKE '%Mont Blanc%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    const deserts = await pool.query(`
      SELECT COUNT(*) as count FROM questions
      WHERE language = 'fr'
        AND (question LIKE '%Sahara%' OR question LIKE '%désert%' OR question LIKE '%Antarctique%')
        AND created_at > NOW() - INTERVAL '5 minutes'
    `);

    console.log('🔍 VERIFICATION OF 35 NEW FRENCH QUESTIONS\n');
    console.log('✅ Questions found by topic:');
    console.log(`   📐 Math - Roman Numerals: ${romanNumerals.rows[0].count}`);
    console.log(`   📐 Math - Negative Numbers: ${negativeNumbers.rows[0].count}`);
    console.log(`   📝 French - Idioms: ${idioms.rows[0].count}`);
    console.log(`   🔬 Science - Magnets: ${magnets.rows[0].count}`);
    console.log(`   ⚡ Science - Electricity: ${electricity.rows[0].count}`);
    console.log(`   🔧 Science - Simple Machines: ${simpleMachines.rows[0].count}`);
    console.log(`   🌤️  Science - Weather: ${weather.rows[0].count}`);
    console.log(`   🕐 Geography - Timezones: ${timezones.rows[0].count}`);
    console.log(`   ⛰️  Geography - Mountains: ${mountains.rows[0].count}`);
    console.log(`   🏜️  Geography - Deserts: ${deserts.rows[0].count}`);

    const total = romanNumerals.rows[0].count +
                  negativeNumbers.rows[0].count +
                  idioms.rows[0].count +
                  magnets.rows[0].count +
                  electricity.rows[0].count +
                  simpleMachines.rows[0].count +
                  weather.rows[0].count +
                  timezones.rows[0].count +
                  mountains.rows[0].count +
                  deserts.rows[0].count;

    console.log(`\n📊 Total verified: ${total} questions`);

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await pool.end();
  }
}

checkNew35();
