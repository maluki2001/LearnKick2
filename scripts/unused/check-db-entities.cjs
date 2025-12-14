const { Pool } = require('pg');

async function checkEntities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check schools
    const schoolsResult = await pool.query('SELECT id, name FROM schools LIMIT 5');
    console.log('\n📚 Schools in database:');
    schoolsResult.rows.forEach(s => console.log(`  - ${s.name} (${s.id})`));

    // Check users
    const usersResult = await pool.query('SELECT id, email, role FROM users LIMIT 5');
    console.log('\n👤 Users in database:');
    usersResult.rows.forEach(u => console.log(`  - ${u.email} [${u.role}] (${u.id})`));

    // Check subjects
    const subjectsResult = await pool.query('SELECT id, name FROM subjects LIMIT 10');
    console.log('\n📖 Subjects in database:');
    subjectsResult.rows.forEach(s => console.log(`  - ${s.name} (${s.id})`));

    // Check a sample question structure
    const questionResult = await pool.query('SELECT * FROM questions LIMIT 1');
    if (questionResult.rows.length > 0) {
      console.log('\n📝 Sample question structure:');
      console.log(JSON.stringify(questionResult.rows[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEntities();
