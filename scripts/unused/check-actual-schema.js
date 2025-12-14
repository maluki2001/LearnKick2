import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgqdpetjyrixpazfbwtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWRwZXRqeXJpeHBhemZid3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTM1NjMsImV4cCI6MjA3MjM4OTU2M30.StPOOgJRqQ8HN0ri06JRigV3GsYO1vEtjAMeov5Itkg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking actual database schema...\n');

  // Try to get schema information
  try {
    console.log('📋 Checking questions table structure...');
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Questions table error:', error.message);
      console.log('Error code:', error.code);
      
      if (error.code === 'PGRST116') {
        console.log('✅ Questions table exists but is empty');
        
        // Try to insert a test record to see what columns are expected
        console.log('🧪 Testing questions table structure with minimal data...');
        const testQuestion = {
          type: 'multiple-choice',
          subject: 'math',
          grade: 2,
          difficulty: 1,
          language: 'en',
          question: 'Test question',
          answers: ['A', 'B', 'C', 'D'],
          correctIndex: 0,
          explanation: 'Test explanation'
        };
        
        const { data: testData, error: testError } = await supabase
          .from('questions')
          .insert(testQuestion)
          .select();
          
        if (testError) {
          console.log('❌ Test insert failed:', testError.message);
          console.log('Details:', testError.details);
          console.log('Hint:', testError.hint);
        } else {
          console.log('✅ Test insert successful!');
          console.log('📊 Actual table structure based on successful insert:', testData);
          
          // Clean up test record
          if (testData && testData[0]) {
            await supabase
              .from('questions')
              .delete()
              .eq('id', testData[0].id);
            console.log('🧹 Cleaned up test record');
          }
        }
      }
    } else {
      console.log('✅ Questions table accessible');
      if (data && data.length > 0) {
        console.log('📊 Sample question structure:', data[0]);
      }
    }
  } catch (error) {
    console.log('❌ Failed to check questions table:', error.message);
  }
  
  // Check subjects table
  try {
    console.log('\n📚 Checking subjects table...');
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Subjects table error:', error.message);
    } else {
      console.log('✅ Subjects table accessible');
      if (data && data.length > 0) {
        console.log('📊 Sample subject structure:', data[0]);
      } else {
        console.log('📋 Subjects table is empty');
      }
    }
  } catch (error) {
    console.log('❌ Failed to check subjects table:', error.message);
  }
}

checkTables().catch(console.error);