// Simple debug script to test game initialization
const { GameEngine } = require('./dist/lib/gameEngine.js');

console.log('🔍 Testing game initialization...');

const player1 = { id: '1', name: 'Test Player', elo: 1000 };
const player2 = { id: '2', name: 'AI Rival', elo: 980 };

const engine = new GameEngine({
  onStateUpdate: (state) => console.log('📊 State updated:', state.gameStatus),
  onGameEnd: (winner) => console.log('🏁 Game ended:', winner),
  onGoal: (player, score) => console.log('⚽ Goal:', player, score)
});

async function testGame() {
  try {
    console.log('🏁 Initializing...');
    await engine.initializeGame(player1, player2, 'soccer', 'math', 'en');
    console.log('✅ Initialization complete');
    
    console.log('🎮 Starting game...');
    engine.startGame();
    console.log('🎯 Game should be running now');
    
    setTimeout(() => {
      console.log('📊 Final state:', engine.getState());
    }, 5000);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGame();