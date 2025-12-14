// Quick database check script
// Run this in browser console to check if questions exist in database

console.log('🔍 Checking database for questions...')

// Try to fetch questions directly from your database
fetch('/api/questions/test')  // If you have an API endpoint
  .then(response => response.json())
  .then(data => {
    console.log('📊 Questions in database:', data)
  })
  .catch(error => {
    console.error('❌ Database check failed:', error)
    
    // Alternative check - try Supabase direct query (if configured)
    console.log('💡 To check questions in Supabase SQL Editor, run:')
    console.log('SELECT COUNT(*) as question_count FROM questions;')
    console.log('SELECT * FROM questions LIMIT 5;')
  })