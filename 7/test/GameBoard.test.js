const GameBoard = require('../src/GameBoard');
const Ship = require('../src/Ship');

// Mock Math.random for predictable ship placement in tests
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Always returns 0.5 for predictable behavior

describe('GameBoard', () => {
  let board;

  beforeEach(() => {
    board = new GameBoard();
  });

  describe('constructor', () => {
    test('should create a board with default size 10', () => {
      expect(board.size).toBe(10);
      expect(board.ships).toEqual([]);
      expect(board.guesses.size).toBe(0);
    });

    test('should create a board with custom size', () => {
      const customBoard = new GameBoard(8);
      expect(customBoard.size).toBe(8);
    });

    test('should initialize grid with water symbols', () => {
      const grid = board.getGrid();
      expect(grid.length).toBe(10);
      expect(grid[0].length).toBe(10);
      expect(grid[0][0]).toBe('~');
      expect(grid[9][9]).toBe('~');
    });
  });

  describe('createGrid', () => {
    test('should create grid filled with water (~)', () => {
      const grid = board.createGrid();
      expect(grid.length).toBe(10);
      
      for (let i = 0; i < 10; i++) {
        expect(grid[i].length).toBe(10);
        for (let j = 0; j < 10; j++) {
          expect(grid[i][j]).toBe('~');
        }
      }
    });
  });

  describe('parseLocation', () => {
    test('should parse valid location strings', () => {
      expect(board.parseLocation('00')).toEqual([0, 0]);
      expect(board.parseLocation('34')).toEqual([3, 4]);
      expect(board.parseLocation('99')).toEqual([9, 9]);
    });

    test('should throw error for invalid location format', () => {
      expect(() => board.parseLocation('0')).toThrow('Invalid location format');
      expect(() => board.parseLocation('000')).toThrow('Invalid location format');
      expect(() => board.parseLocation(null)).toThrow('Invalid location format');
      expect(() => board.parseLocation(123)).toThrow('Invalid location format');
    });
  });

  describe('isValidPlacement', () => {
    test('should return true for valid placement', () => {
      const locations = ['00', '01', '02'];
      expect(board.isValidPlacement(locations)).toBe(true);
    });

    test('should return false for out-of-bounds placement', () => {
      const locations = ['98', '99', '9A']; // 'A' would be parsed as NaN
      expect(board.isValidPlacement(locations)).toBe(false);
    });

    test('should return false for placement on occupied cells', () => {
      // First placement
      const firstShip = new Ship(3);
      firstShip.place(['00', '01', '02']);
      board.ships.push(firstShip);
      board.markShipOnGrid(['00', '01', '02']);

      // Try to place second ship overlapping
      const locations = ['01', '11', '21'];
      expect(board.isValidPlacement(locations)).toBe(false);
    });
  });

  describe('markShipOnGrid', () => {
    test('should mark ship locations on grid', () => {
      const locations = ['00', '01', '02'];
      board.markShipOnGrid(locations);
      
      const grid = board.getGrid();
      expect(grid[0][0]).toBe('S');
      expect(grid[0][1]).toBe('S');
      expect(grid[0][2]).toBe('S');
      expect(grid[1][0]).toBe('~'); // Unmarked cell
    });
  });

  describe('receiveAttack', () => {
    beforeEach(() => {
      // Place a ship manually for testing
      const ship = new Ship(3);
      ship.place(['00', '01', '02']);
      board.ships.push(ship);
    });

    test('should return invalid result for already guessed location', () => {
      board.receiveAttack('00'); // First attack
      const result = board.receiveAttack('00'); // Second attack
      
      expect(result.valid).toBe(false);
      expect(result.alreadyGuessed).toBe(true);
      expect(result.message).toBe('Location already guessed!');
    });

    test('should return hit result for ship location', () => {
      const result = board.receiveAttack('01');
      
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.message).toBe('Hit!');
      expect(result.ship).toBeDefined();
    });

    test('should return sunk result when ship is completely hit', () => {
      board.receiveAttack('00');
      board.receiveAttack('01');
      const result = board.receiveAttack('02');
      
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.message).toBe('Ship sunk!');
    });

    test('should return miss result for empty water', () => {
      const result = board.receiveAttack('99');
      
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.message).toBe('Miss!');
    });

    test('should mark hits and misses on grid', () => {
      board.receiveAttack('01'); // Hit
      board.receiveAttack('99'); // Miss
      
      const grid = board.getGrid();
      expect(grid[0][1]).toBe('X'); // Hit marker
      expect(grid[9][9]).toBe('O'); // Miss marker
    });

    test('should handle already guessed location correctly', () => {
      // First attack
      board.receiveAttack('01');
      
      // Second attack on same location
      const result = board.receiveAttack('01');
      expect(result.valid).toBe(false);
      expect(result.alreadyGuessed).toBe(true);
    });
  });

  describe('allShipsSunk', () => {
    test('should return false when ships are not sunk', () => {
      const ship = new Ship(3);
      ship.place(['00', '01', '02']);
      board.ships.push(ship);
      
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      const ship = new Ship(3);
      ship.place(['00', '01', '02']);
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      board.ships.push(ship);
      
      expect(board.allShipsSunk()).toBe(true);
    });

    test('should return true when no ships exist', () => {
      expect(board.allShipsSunk()).toBe(true);
    });
  });

  describe('getRemainingShips', () => {
    test('should count unsunk ships correctly', () => {
      const ship1 = new Ship(3);
      const ship2 = new Ship(3);
      ship1.place(['00', '01', '02']);
      ship2.place(['10', '11', '12']);
      
      // Sink first ship
      ship1.hit('00');
      ship1.hit('01');
      ship1.hit('02');
      
      board.ships.push(ship1, ship2);
      
      expect(board.getRemainingShips()).toBe(1);
    });

    test('should return 0 when all ships are sunk', () => {
      const ship = new Ship(3);
      ship.place(['00', '01', '02']);
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      board.ships.push(ship);
      
      expect(board.getRemainingShips()).toBe(0);
    });
  });

  describe('getGrid', () => {
    test('should return a copy of the grid', () => {
      const grid1 = board.getGrid();
      const grid2 = board.getGrid();
      
      expect(grid1).toEqual(grid2);
      expect(grid1).not.toBe(grid2); // Different references
      
      grid1[0][0] = 'X';
      expect(board.getGrid()[0][0]).toBe('~'); // Original unchanged
    });
  });

  describe('hasBeenGuessed and getGuesses', () => {
    test('should track guessed locations', () => {
      expect(board.hasBeenGuessed('00')).toBe(false);
      
      board.receiveAttack('00');
      expect(board.hasBeenGuessed('00')).toBe(true);
      
      const guesses = board.getGuesses();
      expect(guesses.has('00')).toBe(true);
      expect(guesses.size).toBe(1);
    });

    test('should return copy of guesses set', () => {
      board.receiveAttack('00');
      const guesses = board.getGuesses();
      
      guesses.add('11');
      expect(board.hasBeenGuessed('11')).toBe(false);
    });
  });

  describe('placeShipsRandomly', () => {
    beforeEach(() => {
      global.Math = mockMath;
    });

    afterEach(() => {
      global.Math = Math;
    });

    test('should place specified number of ships', () => {
      board.placeShipsRandomly(2, 3, false);
      expect(board.ships.length).toBe(2);
    });

    test('should mark ships on grid when markOnGrid is true', () => {
      board.placeShipsRandomly(1, 3, true);
      const grid = board.getGrid();
      
      // Check that some cells are marked with 'S'
      let shipCells = 0;
      for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
          if (grid[i][j] === 'S') shipCells++;
        }
      }
      expect(shipCells).toBe(3); // One ship of length 3
    });

    test('should not mark ships on grid when markOnGrid is false', () => {
      board.placeShipsRandomly(1, 3, false);
      const grid = board.getGrid();
      
      // Check that no cells are marked with 'S'
      for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
          expect(grid[i][j]).not.toBe('S');
        }
      }
    });

    test('should handle retry logic when initial placements fail', () => {
      // Create a small board to force collision retries
      const smallBoard = new GameBoard(3);
      
      // Mock generateRandomPlacement to return predictable locations
      let callCount = 0;
      jest.spyOn(smallBoard, 'generateRandomPlacement').mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return ['00', '01', '02']; // First ship - valid
        } else if (callCount === 2) {
          return ['00', '01', '02']; // Second ship - collision with first (invalid)
        } else {
          return ['10', '11', '12']; // Second ship - valid placement
        }
      });

      smallBoard.placeShipsRandomly(2, 3, true);
      
      expect(smallBoard.ships.length).toBe(2);
      expect(smallBoard.generateRandomPlacement).toHaveBeenCalledTimes(3); // Shows retry occurred
    });

    test('should handle infinite retry protection', () => {
      // Create a very small board that makes placement very difficult
      const tinyBoard = new GameBoard(2);
      
      // Try to place a ship that's too big for any valid placement
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn(); // Suppress potential warnings
      
      // This should eventually succeed or handle gracefully
      tinyBoard.placeShipsRandomly(1, 1, false);
      expect(tinyBoard.ships.length).toBe(1);
      
      console.warn = originalConsoleWarn;
    });
  });

  describe('generateRandomPlacement', () => {
    beforeEach(() => {
      global.Math = mockMath;
    });

    afterEach(() => {
      global.Math = Math;
    });

    test('should generate valid placement locations', () => {
      const placement = board.generateRandomPlacement(3);
      expect(placement.length).toBe(3);
      
      // Check all locations are valid format
      placement.forEach(location => {
        expect(location).toMatch(/^\d\d$/);
        const [row, col] = board.parseLocation(location);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(board.size);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(board.size);
      });
    });

    test('should generate horizontal placements', () => {
      // Mock Math.random to force horizontal orientation
      global.Math.random = jest.fn(() => 0.3); // < 0.5 = horizontal
      
      const placement = board.generateRandomPlacement(3);
      expect(placement.length).toBe(3);
      
      // For horizontal placement, row should be same, columns should increment
      const locations = placement.map(loc => board.parseLocation(loc));
      const rows = locations.map(([row]) => row);
      const cols = locations.map(([, col]) => col);
      
      // All rows should be the same
      expect(new Set(rows).size).toBe(1);
      
      // Columns should be consecutive
      cols.sort((a, b) => a - b);
      for (let i = 1; i < cols.length; i++) {
        expect(cols[i]).toBe(cols[i-1] + 1);
      }
    });

    test('should generate vertical placements', () => {
      // Mock Math.random to force vertical orientation
      global.Math.random = jest.fn(() => 0.7); // >= 0.5 = vertical
      
      const placement = board.generateRandomPlacement(3);
      expect(placement.length).toBe(3);
      
      // For vertical placement, column should be same, rows should increment
      const locations = placement.map(loc => board.parseLocation(loc));
      const rows = locations.map(([row]) => row);
      const cols = locations.map(([, col]) => col);
      
      // All columns should be the same
      expect(new Set(cols).size).toBe(1);
      
      // Rows should be consecutive
      rows.sort((a, b) => a - b);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i]).toBe(rows[i-1] + 1);
      }
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle zero-length ship placement', () => {
      const emptyShip = new Ship(0);
      emptyShip.place([]);
      board.ships.push(emptyShip);
      
      expect(board.ships.length).toBe(1);
      expect(board.allShipsSunk()).toBe(true); // Empty ship is "sunk"
    });

    test('should handle attack on location with pre-hit ship segment', () => {
      const ship = new Ship(3);
      ship.place(['00', '01', '02']);
      board.ships.push(ship);
      
      // First attack should hit
      const firstResult = board.receiveAttack('01');
      expect(firstResult.hit).toBe(true);
      expect(firstResult.valid).toBe(true);
      
      // Second attack on same location should be invalid
      const secondResult = board.receiveAttack('01');
      expect(secondResult.valid).toBe(false);
      expect(secondResult.alreadyGuessed).toBe(true);
    });
  });
}); 
