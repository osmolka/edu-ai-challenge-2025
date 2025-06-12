const Game = require('./src/Game');

/**
 * Modern Battleship Game
 * Entry point for the Sea Battle game using ES6+ features
 * and modular architecture
 */

/**
 * Main function to start the game
 */
async function main() {
  // Game configuration
  const BOARD_SIZE = 10;
  const NUM_SHIPS = 3;
  const SHIP_LENGTH = 3;

  try {
    console.log('='.repeat(50));
    console.log('          WELCOME TO SEA BATTLE');
    console.log('='.repeat(50));
    
    // Create and start the game
    const game = new Game(BOARD_SIZE, NUM_SHIPS, SHIP_LENGTH);
    await game.start();
    
    // Display final statistics
    const stats = game.getGameStats();
    console.log('\n--- GAME STATISTICS ---');
    console.log(`Total turns: ${stats.totalTurns}`);
    console.log(`Player guesses: ${stats.playerGuesses}`);
    console.log(`CPU guesses: ${stats.cpuGuesses}`);
    console.log(`Winner: ${stats.winner || 'None'}`);
    
  } catch (error) {
    console.error('Failed to start game:', error.message);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\nGame interrupted. Thanks for playing!');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

// Start the game
if (require.main === module) {
  main().catch(error => {
    console.error('Game crashed:', error.message);
    process.exit(1);
  });
}

module.exports = { main };
