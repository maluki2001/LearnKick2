import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

// Supabase configuration
const supabaseUrl = 'https://bgqdpetjyrixpazfbwtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWRwZXRqeXJpeHBhemZid3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTM1NjMsImV4cCI6MjA3MjM4OTU2M30.StPOOgJRqQ8HN0ri06JRigV3GsYO1vEtjAMeov5Itkg';

const supabase = createClient(supabaseUrl, supabaseKey);

// File paths
const csvFile = './learnkick-questions-updated.csv';
const subjectsFile = './subjects-data.sql';

async function importSubjects() {
  console.log('🏫 Step 1: Importing subjects...');
  
  try {
    // Read and parse subjects from SQL file
    const sqlContent = fs.readFileSync(subjectsFile, 'utf8');
    const subjects = [];
    
    // Extract subject data from SQL INSERT statements
    const insertLines = sqlContent.split('\n').filter(line => line.startsWith('INSERT INTO subjects'));
    
    for (const line of insertLines) {
      const match = line.match(/VALUES \('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*NULL\)/);
      if (match) {
        subjects.push({
          id: match[1],
          name: match[2],
          slug: match[3],
          school_id: null,
          icon: getSubjectIcon(match[3]),
          color: getSubjectColor(match[3]),
          description: getSubjectDescription(match[3]),
          is_active: true
        });
      }
    }
    
    console.log(`📚 Found ${subjects.length} subjects to import`);
    
    // Insert subjects in batches
    for (let i = 0; i < subjects.length; i += 5) {
      const batch = subjects.slice(i, i + 5);
      
      try {
        const { data, error } = await supabase
          .from('subjects')
          .upsert(batch, { onConflict: 'slug' });
        
        if (error) {
          console.warn(`⚠️ Subject batch ${i/5 + 1} failed:`, error.message);
        } else {
          console.log(`✅ Imported subject batch ${i/5 + 1}`);
        }
      } catch (batchError) {
        console.warn(`⚠️ Subject batch ${i/5 + 1} error:`, batchError.message);
      }
    }
    
    console.log('✅ Subjects import completed');
    
  } catch (error) {
    console.error('❌ Failed to import subjects:', error.message);
  }
}

function getSubjectIcon(slug) {
  const icons = {
    'general-knowledge': '🧠',
    'math': '🔢',
    'geography': '🌍',
    'language': '📖',
    'science': '🔬',
    'history': '📜',
    'art': '🎨'
  };
  return icons[slug] || '📚';
}

function getSubjectColor(slug) {
  const colors = {
    'general-knowledge': '#6366f1',
    'math': '#10b981',
    'geography': '#f59e0b',
    'language': '#ec4899',
    'science': '#06b6d4',
    'history': '#8b5cf6',
    'art': '#f97316'
  };
  return colors[slug] || '#3b82f6';
}

function getSubjectDescription(slug) {
  const descriptions = {
    'general-knowledge': 'General knowledge and trivia questions',
    'math': 'Math, algebra, geometry, and arithmetic',
    'geography': 'World geography, countries, and landmarks',
    'language': 'Language arts, grammar, and vocabulary',
    'science': 'Biology, chemistry, physics, and general science',
    'history': 'World history, events, and civilizations',
    'art': 'Visual arts, music, and creative subjects'
  };
  return descriptions[slug] || 'Educational questions';
}

async function importQuestions() {
  console.log('📝 Step 2: Importing questions...');
  
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
            id: row.id,
            school_id: row.school_id,
            created_by: row.created_by,
            type: row.type,
            subject_id: row.subject_id,
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
            lehrplan21_topic: row.lehrplan21_topic,
            is_active: row.is_active === 'True',
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
          // Import in batches of 50 to avoid timeout
          const batchSize = 50;
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
                .insert(batch);
              
              if (error) {
                console.error(`❌ Batch ${batchNum} failed:`, error.message);
                console.error('Error details:', error);
                errorCount += batch.length;
              } else {
                console.log(`✅ Batch ${batchNum} imported successfully`);
                successCount += batch.length;
              }
              
              // Small delay between batches
              await new Promise(resolve => setTimeout(resolve, 500));
              
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

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (connError) {
    console.error('❌ Connection test failed:', connError.message);
    return false;
  }
}

async function main() {
  console.log('🚀 LearnKick Questions Import Tool');
  console.log('===================================\n');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('💡 Tip: Make sure you have proper database access and RLS policies configured');
    return;
  }
  
  try {
    // Step 1: Import subjects
    await importSubjects();
    
    console.log('\n⏳ Waiting 2 seconds before importing questions...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Import questions
    const result = await importQuestions();
    
    console.log('\n🎉 Import process completed!');
    console.log(`📚 Your question bank now has ${result.successCount} questions ready for use!`);
    
    if (result.errorCount > 0) {
      console.log('\n⚠️ Some questions failed to import. This is usually due to:');
      console.log('  - Row Level Security (RLS) policies requiring proper authentication');
      console.log('  - Foreign key constraints (school_id or user_id not found)');
      console.log('  - Data validation errors');
      console.log('\n💡 Consider running this import as a database administrator with proper privileges');
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
  }
}

// Run the import
main().catch(console.error);