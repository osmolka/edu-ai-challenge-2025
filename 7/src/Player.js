const GameBoard = require('./GameBoard');

/**
 * Base Player class
 */
class Player {
  constructor(name, boardSize = 10) {
    this.name = name;
    this.board = new GameBoard(boardSize);
    this.opponentBoard = new GameBoard(boardSize);
  }

  /**
   * Set up the player's board with ships
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  setupBoard(numShips, shipLength) {
    this.board.placeShipsRandomly(numShips, shipLength, true);
  }

  /**
   * Receive an attack on this player's board
   * @param {string} location - Attack location
   * @returns {Object} Attack result
   */
  receiveAttack(location) {
    return this.board.receiveAttack(location);
  }

  /**
   * Check if this player has lost (all ships sunk)
   * @returns {boolean} True if player has lost
   */
  hasLost() {
    return this.board.allShipsSunk();
  }

  /**
   * Get remaining ships count
   * @returns {number} Number of remaining ships
   */
  getRemainingShips() {
    return this.board.getRemainingShips();
  }

  /**
   * Make a move (to be overridden by subclasses)
   * @returns {Promise<string>} Location to attack
   */
  async makeMove() {
    throw new Error('makeMove must be implemented by subclasses');
  }
}

/**
 * Human Player class
 */
class HumanPlayer extends Player {
  constructor(name = 'Player', boardSize = 10) {
    super(name, boardSize);
  }

  /**
   * Make a move by getting input from user
   * @param {Function} getInput - Function to get user input
   * @returns {Promise<string>} Location to attack
   */
  async makeMove(getInput) {
    return await getInput();
  }

  /**
   * Validate user input
   * @param {string} input - User input
   * @param {number} boardSize - Size of the board
   * @returns {Object} Validation result
   */
  validateInput(input, boardSize = 10) {
    if (!input || input.length !== 2) {
      return {
        valid: false,
        message: 'Input must be exactly two digits (e.g., 00, 34, 98).'
      };
    }

    const row = parseInt(input[0]);
    const col = parseInt(input[1]);

    if (isNaN(row) || isNaN(col) || 
        row < 0 || row >= boardSize || 
        col < 0 || col >= boardSize) {
      return {
        valid: false,
        message: `Please enter valid row and column numbers between 0 and ${boardSize - 1}.`
      };
    }

    if (this.opponentBoard.hasBeenGuessed(input)) {
      return {
        valid: false,
        message: 'You already guessed that location!'
      };
    }

    return { valid: true };
  }
}

/**
 * CPU Player class with hunt and target modes
 */
class CPUPlayer extends Player {
  constructor(name = 'CPU', boardSize = 10) {
    super(name, boardSize);
    this.mode = 'hunt';
    this.targetQueue = [];
    this.lastHit = null;
  }

  /**
   * Make a move using AI strategy
   * @returns {Promise<string>} Location to attack
   */
  async makeMove() {
    let location;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      location = this.targetQueue.shift();
      
      // If this location has already been guessed, continue with hunt mode
      if (this.opponentBoard.hasBeenGuessed(location)) {
        if (this.targetQueue.length === 0) {
          this.mode = 'hunt';
        }
        return this.makeMove(); // Recursive call to try again
      }
    } else {
      this.mode = 'hunt';
      location = this.huntMove();
    }

    return location;
  }

  /**
   * Generate a random hunt move
   * @returns {string} Location to attack
   */
  huntMove() {
    let location;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    do {
      const row = Math.floor(Math.random() * this.opponentBoard.size);
      const col = Math.floor(Math.random() * this.opponentBoard.size);
      location = `${row}${col}`;
      attempts++;
    } while (this.opponentBoard.hasBeenGuessed(location) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback: find any unguessed location
      for (let row = 0; row < this.opponentBoard.size; row++) {
        for (let col = 0; col < this.opponentBoard.size; col++) {
          const loc = `${row}${col}`;
          if (!this.opponentBoard.hasBeenGuessed(loc)) {
            return loc;
          }
        }
      }
    }

    return location;
  }

  /**
   * Process the result of an attack and update strategy
   * @param {string} location - Location that was attacked
   * @param {Object} result - Attack result
   */
  processAttackResult(location, result) {
    if (result.hit) {
      this.lastHit = location;
      
      if (result.sunk) {
        // Ship sunk, return to hunt mode
        this.mode = 'hunt';
        this.targetQueue = [];
      } else {
        // Hit but not sunk, switch to target mode
        this.mode = 'target';
        this.addAdjacentTargets(location);
      }
    } else {
      // Miss - if we were in target mode and queue is empty, return to hunt
      if (this.mode === 'target' && this.targetQueue.length === 0) {
        this.mode = 'hunt';
      }
    }
  }

  /**
   * Add adjacent locations to target queue
   * @param {string} location - Location that was hit
   */
  addAdjacentTargets(location) {
    const [row, col] = this.opponentBoard.parseLocation(location);
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    adjacent.forEach(({ r, c }) => {
      if (this.isValidTarget(r, c)) {
        const adjLocation = `${r}${c}`;
        if (!this.targetQueue.includes(adjLocation)) {
          this.targetQueue.push(adjLocation);
        }
      }
    });
  }

  /**
   * Check if coordinates are valid targets
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if valid target
   */
  isValidTarget(row, col) {
    return row >= 0 && row < this.opponentBoard.size &&
           col >= 0 && col < this.opponentBoard.size &&
           !this.opponentBoard.hasBeenGuessed(`${row}${col}`);
  }

  /**
   * Get current AI mode
   * @returns {string} Current mode ('hunt' or 'target')
   */
  getMode() {
    return this.mode;
  }
}

module.exports = { Player, HumanPlayer, CPUPlayer }; 