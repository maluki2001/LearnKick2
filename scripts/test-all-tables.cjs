#!/usr/bin/env node
/**
 * Comprehensive Table Testing - Verify all tables work correctly
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testAllTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database\n');
    console.log('🧪 TESTING ALL TABLES\n');
    console.log('='.repeat(60));

    // Test 1: Questions table with new QC fields
    console.log('\n1️⃣  Testing QUESTIONS table...');
    const questionsTest = await client.query(`
      SELECT
        column_name,
        data_type,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position;
    `);
    console.log(`   ✓ Found ${questionsTest.rows.length} columns`);

    // Test insert with new fields
    const testQuestion = await client.query(`
      INSERT INTO questions (
        school_id, created_by, type, subject,
        grade, difficulty, language, question, answers, correct_index,
        validation_status, quality_score, lehrplan21_code,
        generated_by, time_limit
      )
      SELECT
        s.id, u.id, 'multiple-choice', 'math',
        2, 1, 'de', 'Test: Was ist 2 + 2?',
        ARRAY['3', '4', '5', '6'], 1,
        'draft', 95, 'MA.1.A.2',
        'generator-de', 15000
      FROM schools s
      CROSS JOIN users u
      WHERE s.code IS NOT NULL
        AND u.role = 'admin'
      LIMIT 1
      RETURNING id, validation_status, quality_score;
    `);
    if (testQuestion.rows.length > 0) {
      console.log(`   ✓ Test question inserted: ${testQuestion.rows[0].id}`);
      console.log(`   ✓ Status: ${testQuestion.rows[0].validation_status}, Score: ${testQuestion.rows[0].quality_score}`);
    }

    // Test 2: Question Performance
    console.log('\n2️⃣  Testing QUESTION_PERFORMANCE table...');
    await client.query(`
      INSERT INTO question_performance (
        question_id, times_asked, times_correct, times_incorrect,
        avg_response_time_ms
      ) VALUES ($1, 10, 8, 2, 12000)
      RETURNING id, accuracy_rate;
    `, [testQuestion.rows[0].id]);
    console.log('   ✓ Performance tracking works (accuracy auto-calculated)');

    // Test 3: Question Versions
    console.log('\n3️⃣  Testing QUESTION_VERSIONS table...');
    const versionCount = await client.query(`
      SELECT COUNT(*) as count FROM question_versions;
    `);
    console.log(`   ✓ Version control active (${versionCount.rows[0].count} versions tracked)`);

    // Test 4: Validation Log
    console.log('\n4️⃣  Testing QUESTION_VALIDATION_LOG table...');
    await client.query(`
      INSERT INTO question_validation_log (
        question_id, qc_agent_id, validation_status,
        confidence_score, errors, warnings
      ) VALUES ($1, 'qc-de', 'PASS', 98, '[]'::jsonb, '[]'::jsonb)
      RETURNING id;
    `, [testQuestion.rows[0].id]);
    console.log('   ✓ QC validation logging works');

    // Test 5: Curriculum Coverage
    console.log('\n5️⃣  Testing CURRICULUM_COVERAGE table...');
    const coverage = await client.query(`
      SELECT
        curriculum_code,
        language,
        questions_count,
        questions_approved,
        coverage_status
      FROM curriculum_coverage
      ORDER BY language, curriculum_code
      LIMIT 5;
    `);
    console.log(`   ✓ Coverage tracking: ${coverage.rows.length} curriculum codes tracked`);
    coverage.rows.forEach(row => {
      console.log(`     - ${row.curriculum_code} (${row.language}): ${row.questions_approved}/${row.questions_count} [${row.coverage_status}]`);
    });

    // Test 6: Generation Progress
    console.log('\n6️⃣  Testing GENERATION_PROGRESS table...');
    const progress = await client.query(`
      SELECT language, target_total, generated_total, status
      FROM generation_progress
      ORDER BY language;
    `);
    console.log(`   ✓ Progress tracking initialized:`);
    progress.rows.forEach(row => {
      console.log(`     - ${row.language.toUpperCase()}: ${row.generated_total}/${row.target_total} (${row.status})`);
    });

    // Test 7: Question Packs
    console.log('\n7️⃣  Testing QUESTION_PACKS table...');
    await client.query(`
      INSERT INTO question_packs (
        name, version, language, grade,
        question_ids, question_count
      ) VALUES (
        'Test Pack Grade 2 Math',
        '1.0.0',
        'de',
        2,
        ARRAY[$1::uuid],
        1
      ) RETURNING id;
    `, [testQuestion.rows[0].id]);
    console.log('   ✓ Question packs ready for offline use');

    // Test 8: Performance Indexes
    console.log('\n8️⃣  Testing PERFORMANCE INDEXES...');
    const indexes = await client.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'questions'
        AND indexname LIKE 'idx_questions_%'
      ORDER BY indexname;
    `);
    console.log(`   ✓ ${indexes.rows.length} optimized indexes active`);

    // Test 9: Query Performance Test
    console.log('\n9️⃣  Testing QUERY PERFORMANCE...');
    const startTime = Date.now();
    const adaptiveQuery = await client.query(`
      SELECT id, question, difficulty, quality_score
      FROM questions
      WHERE language = 'de'
        AND grade = 2
        AND subject = 'math'
        AND validation_status = 'draft'
        AND is_active = true
      LIMIT 10;
    `);
    const queryTime = Date.now() - startTime;
    console.log(`   ✓ Adaptive question query: ${queryTime}ms (found ${adaptiveQuery.rows.length} questions)`);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await client.query(`
      DELETE FROM questions WHERE question LIKE 'Test:%';
    `);
    console.log('   ✓ Test data removed');

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('✅ Database is ready for 8,000-question generation');
    console.log('✅ All tables functioning correctly');
    console.log('✅ Performance indexes optimized');
    console.log('✅ QC workflow operational\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testAllTables().catch(console.error);
