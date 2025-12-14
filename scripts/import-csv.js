#!/usr/bin/env node

/**
 * CSV Import Script for LearnKick Questions
 * 
 * Usage: node scripts/import-csv.js /path/to/questions.csv
 * 
 * Make sure you have your .env.local file configured with Supabase credentials
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Simple CSV parser
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = parseCSVLine(lines[0])
  const questions = []

  console.log('📋 Found headers:', headers)
  console.log('📊 Processing', lines.length - 1, 'data rows...\n')

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i])
      const question = {}

      headers.forEach((header, index) => {
        const value = values[index]?.replace(/"/g, '').trim()
        if (!value) return

        const lowerHeader = header.toLowerCase().trim()
        
        switch (lowerHeader) {
          case 'id':
            question.id = value || `imported-${Date.now()}-${i}`
            break
          case 'type':
            question.type = value
            break
          case 'subject':
            question.subject = value
            break
          case 'grade':
            question.grade = parseInt(value)
            break
          case 'difficulty':
            question.difficulty = parseInt(value)
            break
          case 'language':
            question.language = value
            break
          case 'question':
            question.question = value
            break
          case 'statement':
            question.statement = value
            break
          case 'answer a':
          case 'answer b':
          case 'answer c':
          case 'answer d':
            if (!question.answers) question.answers = []
            const answerIndex = lowerHeader.charCodeAt(7) - 97 // 'a' = 0, 'b' = 1, etc.
            question.answers[answerIndex] = value
            break
          case 'correct index':
            const correctIdx = parseFloat(value)
            if (!isNaN(correctIdx)) {
              question.correct_index = Math.floor(correctIdx)
            }
            break
          case 'correct answer':
            question.correct_answer = value
            break
          case 'explanation':
            question.explanation = value
            break
          case 'unit':
            question.unit = value
            break
          case 'image url':
            question.image_url = value
            break
          case 'tags':
            question.tags = value.split(';').filter(Boolean)
            break
          case 'created at':
            question.created_at = value
            break
          case 'updated at':
            question.updated_at = value
            break
        }
      })

      // Ensure required fields
      question.id = question.id || `imported-${Date.now()}-${i}`
      
      if (!question.created_at) {
        question.created_at = new Date().toISOString()
      }
      if (!question.updated_at) {
        question.updated_at = new Date().toISOString()
      }
      
      question.time_limit = question.time_limit || 15000

      // Handle question types
      if (question.type === 'true-false') {
        question.answers = null
      } else if (question.type === 'number-input') {
        question.answers = null
      } else if (question.type === 'multiple-choice' && question.answers) {
        question.answers = question.answers.filter(answer => answer && answer.trim())
      }

      // Add school_id and created_by (you'll need to replace these)
      question.school_id = 'YOUR_SCHOOL_ID' // Replace with actual school ID
      question.created_by = 'YOUR_USER_ID'  // Replace with actual user ID
      question.is_active = true

      questions.push(question)
    } catch (error) {
      console.warn(`⚠️  Skipping row ${i}: ${error.message}`)
    }
  }

  return questions
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

async function importToSupabase(questions) {
  const { createClient } = require('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🔗 Connected to Supabase')
  console.log('📤 Importing', questions.length, 'questions...\n')

  // Import in batches of 100 to avoid timeouts
  const batchSize = 100
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize)
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(batch)
        .select()

      if (error) {
        console.error('❌ Batch error:', error)
        errorCount += batch.length
      } else {
        successCount += batch.length
        console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${batch.length} questions`)
      }
    } catch (error) {
      console.error('❌ Batch failed:', error.message)
      errorCount += batch.length
    }
  }

  console.log('\n📊 Import Summary:')
  console.log(`✅ Success: ${successCount} questions`)
  console.log(`❌ Failed: ${errorCount} questions`)
  console.log(`📈 Success Rate: ${((successCount / questions.length) * 100).toFixed(1)}%`)
}

// Main execution
async function main() {
  const csvPath = process.argv[2]
  
  if (!csvPath) {
    console.log('Usage: node scripts/import-csv.js /path/to/questions.csv')
    process.exit(1)
  }

  if (!fs.existsSync(csvPath)) {
    console.error('❌ File not found:', csvPath)
    process.exit(1)
  }

  try {
    console.log('📂 Reading CSV file:', csvPath)
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    
    console.log('🔍 Parsing CSV content...')
    const questions = parseCSV(csvContent)
    
    console.log('📊 Parsed', questions.length, 'questions')
    
    if (questions.length === 0) {
      console.log('⚠️  No questions found in CSV')
      return
    }

    // Show sample question for verification
    console.log('\n📝 Sample question:')
    console.log(JSON.stringify(questions[0], null, 2))
    console.log()

    await importToSupabase(questions)
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}