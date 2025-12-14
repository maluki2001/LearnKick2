// Quick test to verify question filtering
const { questionBank } = require('./src/lib/questionBank');

console.log('🧪 Testing question filtering...');

// Test the same parameters as the game
async function testQuestions() {
  try {
    const questions = await questionBank.getAdaptiveQuestions(
      3,     // grade 3
      1400,  // elo (800 + 3*200)
      'math', 
      'en',
      10
    );
    
    console.log('📊 Results:');
    console.log(`- Found ${questions.length} questions`);
    console.log('- Questions:', questions.map(q => ({ 
      id: q.id, 
      question: q.question,
      grade: q.grade,
      difficulty: q.difficulty,
      subject: q.subject,
      language: q.language
    })));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testQuestions();