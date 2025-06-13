import { HumanPlayer, CPUPlayer } from './Player.js';
import UI from './UI.js';

/**
 * Main Game class orchestrating the battleship game
 */
class Game {
  constructor(boardSize = 10, numShips = 3, shipLength = 3) {
    this.boardSize = boardSize;
    this.numShips = numShips;
    this.shipLength = shipLength;
    
    this.humanPlayer = new HumanPlayer('Player', boardSize);
    this.cpuPlayer = new CPUPlayer('CPU', boardSize);
    this.ui = new UI();
    
    this.currentPlayer = this.humanPlayer;
    this.isGameOver = false;
  }

  /**
   * Initialize and start the game
   */
  async start() {
    try {
      this.ui.init();
      await this.setupGame();
      await this.gameLoop();
    } catch (error) {
      this.ui.displayError(`Game error: ${error.message}`);
    } finally {
      this.ui.close();
    }
  }

  /**
   * Set up the game boards and ships
   */
  async setupGame() {
    this.ui.displayMessage('Setting up the game...');
    
    // Place ships for both players
    this.humanPlayer.setupBoard(this.numShips, this.shipLength, true); // Mark human ships visible
    this.cpuPlayer.setupBoard(this.numShips, this.shipLength, false);   // Keep CPU ships hidden
    
    // Set up opponent boards for tracking attacks
    this.humanPlayer.opponentBoard = this.cpuPlayer.board;
    this.cpuPlayer.opponentBoard = this.humanPlayer.board;
    
    this.ui.displayShipsPlaced(this.numShips, 'Player');
    this.ui.displayShipsPlaced(this.numShips, 'CPU');
    this.ui.displayIntro(this.numShips);
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (!this.isGameOver) {
      // Display current game state
      this.ui.displayBoards(this.cpuPlayer.board, this.humanPlayer.board);
      this.ui.displayStatus(
        this.humanPlayer.getRemainingShips(),
        this.cpuPlayer.getRemainingShips()
      );

      // Check for game over conditions
      if (this.checkGameOver()) {
        break;
      }

      // Process current player's turn
      if (this.currentPlayer === this.humanPlayer) {
        await this.processHumanTurn();
      } else {
        await this.processCPUTurn();
      }
    }

    this.endGame();
  }

  /**
   * Process human player's turn
   */
  async processHumanTurn() {
    let validMove = false;
    
    while (!validMove) {
      const input = await this.ui.getInput('Enter your guess (e.g., 00): ');
      const validation = this.humanPlayer.validateInput(input, this.boardSize);
      
      if (!validation.valid) {
        this.ui.displayError(validation.message);
        continue;
      }

      // Process the attack
      const result = this.cpuPlayer.receiveAttack(input);
      this.ui.displayAttackResult('PLAYER', input, result);
      
      if (result.sunk) {
        this.ui.displayMessage('You sunk an enemy battleship!');
      }

      validMove = true;
      this.currentPlayer = this.cpuPlayer; // Switch to CPU turn
    }
  }

  /**
   * Process CPU player's turn
   */
  async processCPUTurn() {
    this.ui.displayCPUTurn();
    
    const location = await this.cpuPlayer.makeMove();
    
    // Show targeting strategy
    if (this.cpuPlayer.getMode() === 'target') {
      this.ui.displayCPUTarget(location);
    }

    // Process the attack
    const result = this.humanPlayer.receiveAttack(location);
    this.ui.displayAttackResult('CPU', location, result);
    
    if (result.sunk) {
      this.ui.displayMessage('CPU sunk your battleship!');
    }

    // Update CPU strategy based on result
    this.cpuPlayer.processAttackResult(location, result);
    
    this.currentPlayer = this.humanPlayer; // Switch back to human turn
  }

  /**
   * Check if the game is over
   * @returns {boolean} True if game should end
   */
  checkGameOver() {
    if (this.humanPlayer.hasLost()) {
      this.isGameOver = true;
      this.winner = this.cpuPlayer;
      return true;
    }
    
    if (this.cpuPlayer.hasLost()) {
      this.isGameOver = true;
      this.winner = this.humanPlayer;
      return true;
    }
    
    return false;
  }

  /**
   * End the game and display results
   */
  endGame() {
    const playerWon = this.winner === this.humanPlayer;
    this.ui.displayBoards(this.cpuPlayer.board, this.humanPlayer.board);
    this.ui.displayGameOver(playerWon);
  }

  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    return {
      totalTurns: this.humanPlayer.opponentBoard.getGuesses().size + 
                  this.cpuPlayer.opponentBoard.getGuesses().size,
      playerGuesses: this.humanPlayer.opponentBoard.getGuesses().size,
      cpuGuesses: this.cpuPlayer.opponentBoard.getGuesses().size,
      playerShipsRemaining: this.humanPlayer.getRemainingShips(),
      cpuShipsRemaining: this.cpuPlayer.getRemainingShips(),
      winner: this.winner ? this.winner.name : null
    };
  }

  /**
   * Reset the game for a new round
   */
  reset() {
    this.humanPlayer = new HumanPlayer('Player', this.boardSize);
    this.cpuPlayer = new CPUPlayer('CPU', this.boardSize);
    this.currentPlayer = this.humanPlayer;
    this.isGameOver = false;
    this.winner = null;
  }
}

export default Game; 
