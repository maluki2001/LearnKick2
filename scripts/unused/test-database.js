// Direct database test - run this in browser console
// This will help us see if RLS is blocking access

console.log('🔍 DIRECT DATABASE TEST - Testing Supabase connection...')

// Method 1: Try to access questions directly
fetch(window.location.origin + '/api/test-db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'database' })
})
.then(r => r.json())
.then(data => console.log('📊 API Test Result:', data))
.catch(err => console.error('❌ API Test Failed:', err))

// Method 2: Check if we can access Supabase client directly
if (typeof window !== 'undefined' && window.__SUPABASE_CLIENT__) {
  const client = window.__SUPABASE_CLIENT__
  console.log('🔍 Supabase client found, testing direct query...')
  
  client.from('questions').select('count(*)', { count: 'exact' })
    .then(({ data, error, count }) => {
      console.log('📊 Direct count query:', { data, error, count })
    })
    .catch(err => console.error('❌ Direct query failed:', err))
} else {
  console.log('⚠️ Supabase client not accessible from browser')
}

// Method 3: Manual query construction
console.log('💡 To test manually in Supabase SQL Editor:')
console.log('SELECT COUNT(*) FROM questions;')
console.log('SELECT * FROM questions LIMIT 5;')
console.log('SHOW rls_enabled FROM questions;')