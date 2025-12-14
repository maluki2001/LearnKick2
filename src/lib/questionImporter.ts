import { Question, Subject, Language, Grade, Difficulty } from '@/types/questions'

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  warnings: string[]
  questions: Question[]
}

export interface CSVRow {
  [key: string]: string
}

export class QuestionImporter {
  
  /**
   * Import questions from CSV data
   */
  static importFromCSV(csvData: string): ImportResult {
    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [],
      warnings: [],
      questions: []
    }

    try {
      const lines = csvData.trim().split('\n')
      if (lines.length < 2) {
        result.errors.push('CSV must contain header and at least one data row')
        return result
      }

      const headers = this.parseCSVRow(lines[0])
      console.log('📋 CSV Headers found:', headers)

      // Validate required headers
      const requiredHeaders = ['id', 'type', 'subject', 'grade', 'difficulty', 'language', 'timeLimit']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
        return result
      }

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const rowData = this.parseCSVRow(lines[i])
        if (rowData.length === 0) continue // Skip empty rows

        const row: CSVRow = {}
        headers.forEach((header, index) => {
          row[header] = rowData[index] || ''
        })

        try {
          const question = this.parseQuestion(row, i + 1)
          if (question) {
            result.questions.push(question)
            result.imported++
          }
        } catch (error) {
          result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      result.success = result.errors.length === 0
      console.log(`✅ Import complete: ${result.imported} questions, ${result.errors.length} errors`)
      
    } catch (error) {
      result.errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Parse a single question from CSV row
   */
  private static parseQuestion(row: CSVRow, rowNumber: number): Question | null {
    // Validate required fields
    this.validateRequired(row, ['id', 'type', 'subject', 'grade', 'difficulty', 'language', 'timeLimit'])

    // Parse base fields
    const base = {
      id: row.id.trim(),
      subject: this.validateEnum(row.subject, ['math', 'geography', 'language', 'general-knowledge']) as Subject,
      grade: this.validateNumber(row.grade, 1, 6) as Grade,
      difficulty: this.validateNumber(row.difficulty, 1, 5) as Difficulty,
      language: this.validateEnum(row.language, ['en', 'de', 'fr']) as Language,
      timeLimit: this.validateNumber(row.timeLimit, 5000, 30000),
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      lehrplan21Topic: row.lehrplan21Topic || undefined
    }

    // Parse question type specific fields
    switch (row.type) {
      case 'multiple-choice':
        return {
          ...base,
          type: 'multiple-choice',
          question: this.validateRequired(row, ['question']).question,
          answers: [
            this.validateRequired(row, ['answer1']).answer1,
            this.validateRequired(row, ['answer2']).answer2,
            this.validateRequired(row, ['answer3']).answer3,
            this.validateRequired(row, ['answer4']).answer4
          ],
          correctIndex: this.validateNumber(row.correctIndex, 0, 3),
          explanation: row.explanation || undefined
        }

      case 'true-false':
        return {
          ...base,
          type: 'true-false',
          statement: this.validateRequired(row, ['statement']).statement,
          correct: this.validateBoolean(row.correctBoolean),
          explanation: row.explanation || undefined
        }

      case 'number-input':
        return {
          ...base,
          type: 'number-input',
          question: this.validateRequired(row, ['question']).question,
          correctAnswer: this.validateNumber(row.correctNumber),
          tolerance: row.tolerance ? parseFloat(row.tolerance) : undefined,
          unit: row.unit || undefined,
          explanation: row.explanation || undefined
        }

      case 'image-question':
        return {
          ...base,
          type: 'image-question',
          question: this.validateRequired(row, ['question']).question,
          imageUrl: this.validateRequired(row, ['imageUrl']).imageUrl,
          answers: [
            this.validateRequired(row, ['answer1']).answer1,
            this.validateRequired(row, ['answer2']).answer2,
            this.validateRequired(row, ['answer3']).answer3,
            this.validateRequired(row, ['answer4']).answer4
          ],
          correctIndex: this.validateNumber(row.correctIndex, 0, 3),
          explanation: row.explanation || undefined
        }

      default:
        throw new Error(`Invalid question type: ${row.type}`)
    }
  }

  /**
   * Parse CSV row handling quoted fields
   */
  private static parseCSVRow(row: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < row.length) {
      const char = row[i]
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
          continue
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
          continue
        }
      }
      
      if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
        i++
        continue
      }
      
      current += char
      i++
    }
    
    result.push(current.trim())
    return result
  }

  /**
   * Validation helpers
   */
  private static validateRequired(row: CSVRow, fields: string[]): CSVRow {
    for (const field of fields) {
      if (!row[field] || row[field].trim() === '') {
        throw new Error(`Required field '${field}' is missing or empty`)
      }
    }
    return row
  }

  private static validateEnum(value: string, allowedValues: string[]): string {
    const trimmed = value.trim()
    if (!allowedValues.includes(trimmed)) {
      throw new Error(`Invalid value '${trimmed}'. Must be one of: ${allowedValues.join(', ')}`)
    }
    return trimmed
  }

  private static validateNumber(value: string, min?: number, max?: number): number {
    const num = parseFloat(value.trim())
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${value}`)
    }
    if (min !== undefined && num < min) {
      throw new Error(`Number ${num} is below minimum ${min}`)
    }
    if (max !== undefined && num > max) {
      throw new Error(`Number ${num} is above maximum ${max}`)
    }
    return num
  }

  private static validateBoolean(value: string): boolean {
    const trimmed = value.trim().toLowerCase()
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    throw new Error(`Invalid boolean value: ${value}. Must be 'true' or 'false'`)
  }

  /**
   * Generate sample CSV for testing
   */
  static generateSampleCSV(): string {
    return `id,type,subject,grade,difficulty,language,timeLimit,tags,lehrplan21Topic,question,answer1,answer2,answer3,answer4,correctIndex,statement,correctBoolean,correctNumber,tolerance,unit,imageUrl,explanation
math_3_addition_1,multiple-choice,math,3,2,en,15000,"addition,basic",MA.1.A.2,"What is 15 + 27?",40,42,44,45,1,,,,,,,15 + 27 = 42
math_3_fractions_2,multiple-choice,math,3,3,en,18000,"fractions,halves",MA.1.A.3,"What is 1/2 of 20?",8,10,12,15,1,,,,,,,Half of 20 is 10
lang_3_spelling_1,multiple-choice,language,3,2,en,12000,"spelling,animals",E.4.A.1,"Which animal lives in water?",cat,fish,dog,bird,1,,,,,,,Fish live in water
math_3_counting_1,true-false,math,3,1,en,10000,"counting,basic",MA.1.A.1,,,,,,A dozen means 12 items,true,,,,,"A dozen is 12"
math_3_subtraction_1,number-input,math,3,2,en,15000,"subtraction,basic",MA.1.A.2,"What is 25 - 8?",,,,,,,,17,0,,25 - 8 = 17`
  }
}

export const questionImporter = new QuestionImporter()