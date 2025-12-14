import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgqdpetjyrixpazfbwtn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWRwZXRqeXJpeHBhemZid3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTM1NjMsImV4cCI6MjA3MjM4OTU2M30.StPOOgJRqQ8HN0ri06JRigV3GsYO1vEtjAMeov5Itkg';

console.log('🔍 Testing Questions Database');
console.log('=============================');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuestions() {
  try {
    console.log('\n1. Testing basic query...');
    
    // Test 1: Basic query
    const { data: basicData, error: basicError, count } = await supabase
      .from('questions')
      .select('*', { count: 'exact' });
    
    if (basicError) {
      console.log('❌ Basic Query Error:', basicError.message);
      console.log('   Code:', basicError.code);
      console.log('   Details:', basicError.details);
      console.log('   Hint:', basicError.hint);
    } else {
      console.log('✅ Basic query successful');
      console.log('📊 Total questions found:', count);
      console.log('📝 Data length:', basicData?.length || 0);
      
      if (basicData && basicData.length > 0) {
        console.log('🔍 First question sample:');
        console.log({
          id: basicData[0].id,
          subject: basicData[0].subject,
          grade: basicData[0].grade,
          question: basicData[0].question?.substring(0, 100) + '...',
          type: basicData[0].type,
          created_at: basicData[0].created_at
        });
      }
    }
    
    console.log('\n2. Testing specific filters...');
    
    // Test 2: Try with common filters
    const { data: filteredData, error: filterError } = await supabase
      .from('questions')
      .select('subject, grade, count(*)')
      .limit(10);
    
    if (filterError) {
      console.log('❌ Filtered Query Error:', filterError.message);
    } else {
      console.log('✅ Filtered query successful');
      console.log('📋 Filtered results:', filteredData?.length || 0);
    }
    
    console.log('\n3. Testing different query approach...');
    
    // Test 3: Different approach
    const { data: simpleData, error: simpleError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);
    
    if (simpleError) {
      console.log('❌ Simple Query Error:', simpleError.message);
    } else {
      console.log('✅ Simple query successful');
      console.log('🎯 Found question IDs:', simpleData?.map(q => q.id) || []);
    }
    
    console.log('\n4. Checking authentication status...');
    
    // Test 4: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message);
    } else {
      console.log('👤 User authenticated:', !!user);
      if (user) {
        console.log('   User ID:', user.id);
        console.log('   Email:', user.email);
      } else {
        console.log('   No authenticated user found');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testQuestions();