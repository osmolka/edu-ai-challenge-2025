const Ship = require('./Ship');

/**
 * GameBoard class managing the game board state and ship placement
 */
class GameBoard {
  constructor(size = 10) {
    this.size = size;
    this.grid = this.createGrid();
    this.ships = [];
    this.guesses = new Set();
  }

  /**
   * Create an empty grid filled with water (~)
   * @returns {string[][]} 2D grid array
   */
  createGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill('~')
    );
  }

  /**
   * Place ships randomly on the board
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @param {boolean} markOnGrid - Whether to mark ships on the grid (for player board)
   */
  placeShipsRandomly(numShips, shipLength, markOnGrid = false) {
    let placedShips = 0;
    
    while (placedShips < numShips) {
      const ship = new Ship(shipLength);
      const placement = this.generateRandomPlacement(shipLength);
      
      if (this.isValidPlacement(placement)) {
        ship.place(placement);
        this.ships.push(ship);
        
        if (markOnGrid) {
          this.markShipOnGrid(placement);
        }
        
        placedShips++;
      }
    }
  }

  /**
   * Generate random ship placement
   * @param {number} length - Ship length
   * @returns {string[]} Array of location strings
   */
  generateRandomPlacement(length) {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const locations = [];
    
    let startRow, startCol;
    
    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * this.size);
      startCol = Math.floor(Math.random() * (this.size - length + 1));
    } else {
      startRow = Math.floor(Math.random() * (this.size - length + 1));
      startCol = Math.floor(Math.random() * this.size);
    }
    
    for (let i = 0; i < length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      locations.push(`${row}${col}`);
    }
    
    return locations;
  }

  /**
   * Check if a ship placement is valid (no collisions)
   * @param {string[]} locations - Proposed ship locations
   * @returns {boolean} True if placement is valid
   */
  isValidPlacement(locations) {
    return locations.every(location => {
      const [row, col] = this.parseLocation(location);
      return row >= 0 && row < this.size && 
             col >= 0 && col < this.size && 
             this.grid[row][col] === '~';
    });
  }

  /**
   * Mark ship locations on the grid
   * @param {string[]} locations - Ship locations to mark
   */
  markShipOnGrid(locations) {
    locations.forEach(location => {
      const [row, col] = this.parseLocation(location);
      this.grid[row][col] = 'S';
    });
  }

  /**
   * Process a guess at a specific location
   * @param {string} location - Location string (e.g., '00')
   * @returns {Object} Result object with hit status and ship sunk info
   */
  receiveAttack(location) {
    if (this.guesses.has(location)) {
      return { 
        valid: false, 
        alreadyGuessed: true,
        message: 'Location already guessed!' 
      };
    }

    this.guesses.add(location);
    const [row, col] = this.parseLocation(location);
    
    // Find if any ship is hit
    const hitShip = this.ships.find(ship => ship.hasLocation(location));
    
    if (hitShip && !hitShip.isHitAt(location)) {
      hitShip.hit(location);
      this.grid[row][col] = 'X'; // Mark hit
      
      const sunk = hitShip.isSunk();
      return {
        valid: true,
        hit: true,
        sunk,
        message: sunk ? 'Ship sunk!' : 'Hit!',
        ship: hitShip
      };
    }
    
    // Miss
    this.grid[row][col] = 'O';
    return {
      valid: true,
      hit: false,
      sunk: false,
      message: 'Miss!'
    };
  }

  /**
   * Parse location string into row and column numbers
   * @param {string} location - Location string (e.g., '00', '34')
   * @returns {number[]} [row, col] array
   */
  parseLocation(location) {
    if (typeof location !== 'string' || location.length !== 2) {
      throw new Error('Invalid location format');
    }
    return [parseInt(location[0]), parseInt(location[1])];
  }

  /**
   * Check if all ships are sunk
   * @returns {boolean} True if all ships are sunk
   */
  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  /**
   * Get the number of remaining ships
   * @returns {number} Number of unsunk ships
   */
  getRemainingShips() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Get a copy of the current grid
   * @returns {string[][]} Copy of the grid
   */
  getGrid() {
    return this.grid.map(row => [...row]);
  }

  /**
   * Check if a location has been guessed
   * @param {string} location - Location to check
   * @returns {boolean} True if location has been guessed
   */
  hasBeenGuessed(location) {
    return this.guesses.has(location);
  }

  /**
   * Get all guessed locations
   * @returns {Set} Set of guessed locations
   */
  getGuesses() {
    return new Set(this.guesses);
  }
}

module.exports = GameBoard; 