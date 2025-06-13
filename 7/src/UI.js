import readline from 'readline';

/**
 * UI class handling display and user interaction
 */
class UI {
  constructor() {
    this.rl = null;
  }

  /**
   * Initialize the readline interface
   */
  init() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Close the readline interface
   */
  close() {
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Display the game boards side by side
   * @param {GameBoard} opponentBoard - Opponent's board (CPU)
   * @param {GameBoard} playerBoard - Player's board
   */
  displayBoards(opponentBoard, playerBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Header with column numbers
    let header = '  ';
    for (let h = 0; h < opponentBoard.size; h++) {
      header += h + ' ';
    }
    console.log(header + '     ' + header);

    // Display rows
    const opponentGrid = opponentBoard.getGrid();
    const playerGrid = playerBoard.getGrid();

    for (let i = 0; i < opponentBoard.size; i++) {
      let rowStr = i + ' ';

      // Opponent board row
      for (let j = 0; j < opponentBoard.size; j++) {
        rowStr += opponentGrid[i][j] + ' ';
      }
      
      rowStr += '    ' + i + ' ';

      // Player board row
      for (let j = 0; j < playerBoard.size; j++) {
        rowStr += playerGrid[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Get user input asynchronously
   * @param {string} prompt - Prompt message
   * @returns {Promise<string>} User input
   */
  async getInput(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Display a message to the user
   * @param {string} message - Message to display
   */
  displayMessage(message) {
    console.log(message);
  }

  /**
   * Display game introduction
   * @param {number} numShips - Number of ships in the game
   */
  displayIntro(numShips) {
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${numShips} enemy ships.`);
    console.log('Enter coordinates as two digits (e.g., 00 for row 0 col 0, 34 for row 3 col 4)');
    console.log('');
  }

  /**
   * Display game over message
   * @param {boolean} playerWon - True if player won
   */
  displayGameOver(playerWon) {
    console.log('\n' + '='.repeat(50));
    if (playerWon) {
      console.log('*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    } else {
      console.log('*** GAME OVER! The CPU sunk all your battleships! ***');
    }
    console.log('='.repeat(50));
  }

  /**
   * Display attack result
   * @param {string} attacker - Name of the attacker
   * @param {string} location - Location attacked
   * @param {Object} result - Attack result
   */
  displayAttackResult(attacker, location, result) {
    if (result.hit) {
      if (result.sunk) {
        console.log(`${attacker} HIT at ${location}! Ship sunk!`);
      } else {
        console.log(`${attacker} HIT at ${location}!`);
      }
    } else {
      console.log(`${attacker} MISS at ${location}.`);
    }
  }

  /**
   * Display CPU turn indicator
   */
  displayCPUTurn() {
    console.log("\n--- CPU's Turn ---");
  }

  /**
   * Display CPU targeting mode
   * @param {string} location - Location being targeted
   */
  displayCPUTarget(location) {
    console.log(`CPU targets: ${location}`);
  }

  /**
   * Display error message
   * @param {string} message - Error message
   */
  displayError(message) {
    console.log(`Error: ${message}`);
  }

  /**
   * Display ship placement confirmation
   * @param {number} numShips - Number of ships placed
   * @param {string} player - Player name
   */
  displayShipsPlaced(numShips, player) {
    console.log(`${numShips} ships placed randomly for ${player}.`);
  }

  /**
   * Display current game status
   * @param {number} playerShips - Remaining player ships
   * @param {number} cpuShips - Remaining CPU ships
   */
  displayStatus(playerShips, cpuShips) {
    console.log(`Your ships: ${playerShips} | Enemy ships: ${cpuShips}`);
  }

  /**
   * Clear the console (if supported)
   */
  clearScreen() {
    if (process.stdout.isTTY) {
      console.clear();
    }
  }

  /**
   * Display a separator line
   */
  displaySeparator() {
    console.log('-'.repeat(50));
  }
}

export default UI; 