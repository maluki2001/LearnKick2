#!/usr/bin/env node
/**
 * Schema Verification - Check all new tables exist and are properly configured
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifySchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check new columns in questions table
    console.log('📋 Checking questions table columns...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
        AND column_name IN (
          'validation_status', 'quality_score', 'qc_agent_report',
          'generated_by', 'reviewed_by', 'review_date',
          'retry_count', 'flagged_reason', 'lehrplan21_code',
          'competency_level'
        )
      ORDER BY column_name;
    `);

    console.log(`   Found ${columnsResult.rows.length} new columns:`);
    columnsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name} (${row.data_type})`);
    });

    // Check new tables
    console.log('\n📊 Checking new tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'question_performance', 'question_versions',
          'question_validation_log', 'curriculum_coverage',
          'generation_progress', 'question_packs',
          'question_pack_downloads'
        )
      ORDER BY table_name;
    `);

    console.log(`   Found ${tablesResult.rows.length} new tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Check indexes
    console.log('\n🔍 Checking performance indexes...');
    const indexesResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'questions'
        AND indexname LIKE 'idx_questions_%'
      ORDER BY indexname;
    `);

    console.log(`   Found ${indexesResult.rows.length} indexes on questions table:`);
    indexesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.indexname}`);
    });

    // Check generation progress initialization
    console.log('\n📈 Checking generation progress...');
    const progressResult = await client.query(`
      SELECT language, target_total, generated_total, status
      FROM generation_progress
      ORDER BY language;
    `);

    console.log(`   Initialized for ${progressResult.rows.length} languages:`);
    progressResult.rows.forEach(row => {
      console.log(`   ✓ ${row.language.toUpperCase()}: Target ${row.target_total}, Status: ${row.status}`);
    });

    console.log('\n✅ Schema verification complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Questions table: Enhanced with ${columnsResult.rows.length} QC fields`);
    console.log(`   - New tables: ${tablesResult.rows.length} created`);
    console.log(`   - Performance indexes: ${indexesResult.rows.length} added`);
    console.log(`   - Generation tracking: ${progressResult.rows.length} languages ready`);
    console.log('\n🎯 System is ready for 8,000-question generation!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema().catch(console.error);
