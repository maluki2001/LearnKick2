import { createClient } from '@supabase/supabase-js';

// Use the credentials from .env.local
const supabaseUrl = 'https://bgqdpetjyrixpazfbwtn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWRwZXRqeXJpeHBhemZid3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTM1NjMsImV4cCI6MjA3MjM4OTU2M30.StPOOgJRqQ8HN0ri06JRigV3GsYO1vEtjAMeov5Itkg';

console.log('🔍 Testing Supabase Database Connection');
console.log('=====================================');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('questions')
      .select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.log('❌ Connection Error:', connectionError.message);
      console.log('   Code:', connectionError.code);
      console.log('   Details:', connectionError.details);
      console.log('   Hint:', connectionError.hint);
    } else {
      console.log('✅ Connection successful');
      console.log('📊 Total questions count:', connectionTest);
    }
    
    console.log('\n2. Testing direct query...');
    
    // Test 2: Try to select actual data
    const { data: questionsData, error: queryError } = await supabase
      .from('questions')
      .select('id, subject, grade, question')
      .limit(5);
    
    if (queryError) {
      console.log('❌ Query Error:', queryError.message);
      console.log('   Code:', queryError.code);
      console.log('   Details:', queryError.details);
      console.log('   Hint:', queryError.hint);
    } else {
      console.log('✅ Query successful');
      console.log('📝 Sample questions found:', questionsData?.length || 0);
      if (questionsData && questionsData.length > 0) {
        console.log('First question:', questionsData[0]);
      }
    }
    
    console.log('\n3. Testing without any filters...');
    
    // Test 3: Try without any school_id filter
    const { data: allQuestions, error: allError } = await supabase
      .from('questions')
      .select('count(*)', { count: 'exact' });
    
    if (allError) {
      console.log('❌ All Questions Error:', allError.message);
    } else {
      console.log('✅ All questions count successful');
      console.log('📊 Total questions (no filters):', allQuestions);
    }
    
    console.log('\n4. Testing table existence...');
    
    // Test 4: Check if the table actually exists
    const { data: tables, error: tableError } = await supabase
      .rpc('get_table_info');  // This might not work, but let's try
    
    if (tableError) {
      console.log('⚠️  Table check not available:', tableError.message);
    } else {
      console.log('📋 Table info:', tables);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testConnection();