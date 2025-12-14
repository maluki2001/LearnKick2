import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

// Supabase configuration
const supabaseUrl = 'https://bgqdpetjyrixpazfbwtn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWRwZXRqeXJpeHBhemZid3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTM1NjMsImV4cCI6MjA3MjM4OTU2M30.StPOOgJRqQ8HN0ri06JRigV3GsYO1vEtjAMeov5Itkg';

// Try service role key if available - this bypasses RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// File path
const csvFile = './learnkick-questions-simple.csv';

async function testInsert() {
  console.log('🧪 Testing single question insert...');
  
  const testQuestion = {
    type: 'multiple-choice',
    subject: 'math', 
    grade: 2,
    difficulty: 1,
    language: 'en',
    question: 'What is 1 + 1?',
    answers: JSON.stringify(['1', '2', '3', '4']),
    correct_index: 1,
    explanation: '1 + 1 equals 2',
    time_limit: 15000
  };
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert(testQuestion)
      .select();
    
    if (error) {
      console.error('❌ Test insert failed:', error.message);
      console.log('Error details:', error);
      return false;
    }
    
    console.log('✅ Test insert successful!');
    
    // Clean up test record
    if (data && data[0]) {
      await supabase
        .from('questions')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Cleaned up test record');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Test insert error:', err.message);
    return false;
  }
}

async function importQuestions() {
  console.log('📝 Importing questions from simplified CSV...');
  
  return new Promise((resolve, reject) => {
    const questions = [];
    let processedCount = 0;
    
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse JSON fields
          const answers = row.answers ? JSON.parse(row.answers) : null;
          const tags = row.tags ? JSON.parse(row.tags) : null;
          
          // Convert string values to appropriate types
          const question = {
            type: row.type,
            subject: row.subject,
            grade: parseInt(row.grade),
            difficulty: parseInt(row.difficulty),
            language: row.language,
            question: row.question || null,
            statement: row.statement || null,
            answers: answers,
            correct_index: row.correct_index ? parseInt(row.correct_index) : null,
            correct_answer: row.correct_answer || null,
            explanation: row.explanation || null,
            unit: row.unit || null,
            image_url: row.image_url || null,
            tags: tags,
            time_limit: parseInt(row.time_limit),
            created_at: row.created_at,
            updated_at: row.updated_at
          };
          
          questions.push(question);
          processedCount++;
          
          if (processedCount % 100 === 0) {
            console.log(`📖 Parsed ${processedCount} questions...`);
          }
          
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse question ${processedCount + 1}:`, parseError.message);
        }
      })
      .on('end', async () => {
        console.log(`📊 Total questions parsed: ${questions.length}`);
        
        try {
          // Import in smaller batches to avoid timeout
          const batchSize = 25; // Even smaller batches
          let successCount = 0;
          let errorCount = 0;
          
          for (let i = 0; i < questions.length; i += batchSize) {
            const batch = questions.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(questions.length / batchSize);
            
            console.log(`📤 Importing batch ${batchNum}/${totalBatches} (${batch.length} questions)...`);
            
            try {
              const { data, error } = await supabase
                .from('questions')
                .insert(batch)
                .select('id');
              
              if (error) {
                console.error(`❌ Batch ${batchNum} failed:`, error.message);
                errorCount += batch.length;
                
                // Try individual inserts for this batch
                console.log(`🔄 Trying individual inserts for batch ${batchNum}...`);
                for (const question of batch) {
                  try {
                    const { error: individualError } = await supabase
                      .from('questions')
                      .insert(question);
                    
                    if (individualError) {
                      console.log(`❌ Individual question failed: ${individualError.message}`);
                    } else {
                      successCount++;
                    }
                  } catch (individualErr) {
                    console.log(`❌ Individual question error: ${individualErr.message}`);
                  }
                }
                
                errorCount -= batch.length; // Reset since we tried individually
                
              } else {
                console.log(`✅ Batch ${batchNum} imported successfully`);
                successCount += batch.length;
              }
              
              // Longer delay between batches to be safe
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (batchError) {
              console.error(`❌ Batch ${batchNum} error:`, batchError.message);
              errorCount += batch.length;
            }
          }
          
          console.log('\n📊 Import Summary:');
          console.log(`✅ Successfully imported: ${successCount} questions`);
          console.log(`❌ Failed to import: ${errorCount} questions`);
          console.log(`📝 Total questions: ${questions.length}`);
          
          resolve({ successCount, errorCount, totalCount: questions.length });
          
        } catch (importError) {
          console.error('❌ Import process failed:', importError);
          reject(importError);
        }
      })
      .on('error', (csvError) => {
        console.error('❌ CSV parsing failed:', csvError);
        reject(csvError);
      });
  });
}

async function main() {
  console.log('🚀 LearnKick Simple Questions Import');
  console.log('====================================\n');
  
  // Test a single insert first
  const testPassed = await testInsert();
  if (!testPassed) {
    console.log('\n💡 Tips to fix import issues:');
    console.log('  1. Make sure you have admin access to the database');
    console.log('  2. Check that RLS policies allow your user to insert questions');
    console.log('  3. Consider using a service role key instead of anon key');
    console.log('  4. Verify the questions table exists with the correct schema');
    return;
  }
  
  console.log('\n⏳ Starting bulk import...');
  
  try {
    const result = await importQuestions();
    
    console.log('\n🎉 Import process completed!');
    if (result.successCount > 0) {
      console.log(`📚 Your question bank now has ${result.successCount} questions ready for use!`);
    }
    
    if (result.errorCount > 0) {
      console.log('\n⚠️ Some questions failed to import. This could be due to:');
      console.log('  - RLS policies restricting access');
      console.log('  - Duplicate questions (if IDs conflict)');
      console.log('  - Data validation errors');
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
  }
}

// Run the import
main().catch(console.error);