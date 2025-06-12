const { Player, HumanPlayer, CPUPlayer } = require('../src/Player');

describe('Player Classes', () => {
  describe('Player (Base Class)', () => {
    let player;

    beforeEach(() => {
      player = new Player('TestPlayer');
    });

    test('should create player with name and boards', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.board).toBeDefined();
      expect(player.opponentBoard).toBeDefined();
      expect(player.board.size).toBe(10);
    });

    test('should create player with custom board size', () => {
      const customPlayer = new Player('Test', 8);
      expect(customPlayer.board.size).toBe(8);
      expect(customPlayer.opponentBoard.size).toBe(8);
    });

    test('should setup board with ships', () => {
      player.setupBoard(2, 3);
      expect(player.board.ships.length).toBe(2);
      expect(player.board.ships[0].length).toBe(3);
    });

    test('should receive attacks on board', () => {
      player.setupBoard(1, 3);
      const result = player.receiveAttack('00');
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });

    test('should check if player has lost', () => {
      expect(player.hasLost()).toBe(true); // No ships placed yet
      
      player.setupBoard(1, 3);
      expect(player.hasLost()).toBe(false); // Ships placed but not sunk
    });

    test('should get remaining ships count', () => {
      expect(player.getRemainingShips()).toBe(0);
      
      player.setupBoard(2, 3);
      expect(player.getRemainingShips()).toBe(2);
    });

    test('should throw error when makeMove is called on base class', async () => {
      await expect(player.makeMove()).rejects.toThrow('makeMove must be implemented by subclasses');
    });
  });

  describe('HumanPlayer', () => {
    let humanPlayer;

    beforeEach(() => {
      humanPlayer = new HumanPlayer();
    });

    test('should create human player with default name', () => {
      expect(humanPlayer.name).toBe('Player');
      expect(humanPlayer).toBeInstanceOf(Player);
    });

    test('should create human player with custom name', () => {
      const customPlayer = new HumanPlayer('Alice');
      expect(customPlayer.name).toBe('Alice');
    });

    test('should make move using input function', async () => {
      const mockGetInput = jest.fn().mockResolvedValue('34');
      const result = await humanPlayer.makeMove(mockGetInput);
      
      expect(result).toBe('34');
      expect(mockGetInput).toHaveBeenCalledTimes(1);
    });

    describe('validateInput', () => {
      test('should validate correct input format', () => {
        const result = humanPlayer.validateInput('34');
        expect(result.valid).toBe(true);
      });

      test('should reject input with wrong length', () => {
        expect(humanPlayer.validateInput('1').valid).toBe(false);
        expect(humanPlayer.validateInput('123').valid).toBe(false);
        expect(humanPlayer.validateInput('').valid).toBe(false);
        expect(humanPlayer.validateInput(null).valid).toBe(false);
      });

      test('should reject input with invalid coordinates', () => {
        expect(humanPlayer.validateInput('AA').valid).toBe(false);
        expect(humanPlayer.validateInput('99').valid).toBe(true); // 9,9 is valid for 10x10 board
        expect(humanPlayer.validateInput('-1').valid).toBe(false);
      });

      test('should reject already guessed locations', () => {
        humanPlayer.opponentBoard.receiveAttack('34');
        const result = humanPlayer.validateInput('34');
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('You already guessed that location!');
      });

      test('should provide appropriate error messages', () => {
        expect(humanPlayer.validateInput('1').message).toContain('exactly two digits');
        expect(humanPlayer.validateInput('AA').message).toContain('valid row and column numbers');
      });

      test('should validate with custom board size', () => {
        const result = humanPlayer.validateInput('77', 8);
        expect(result.valid).toBe(true); // 7,7 is valid for size 8 (coordinates 0-7)
      });
    });
  });

  describe('CPUPlayer', () => {
    let cpuPlayer;

    beforeEach(() => {
      cpuPlayer = new CPUPlayer();
    });

    test('should create CPU player with default name and hunt mode', () => {
      expect(cpuPlayer.name).toBe('CPU');
      expect(cpuPlayer.mode).toBe('hunt');
      expect(cpuPlayer.targetQueue).toEqual([]);
      expect(cpuPlayer.lastHit).toBe(null);
      expect(cpuPlayer).toBeInstanceOf(Player);
    });

    test('should create CPU player with custom name', () => {
      const customCPU = new CPUPlayer('HAL');
      expect(customCPU.name).toBe('HAL');
    });

    describe('makeMove', () => {
      test('should return valid location string', async () => {
        const location = await cpuPlayer.makeMove();
        expect(location).toMatch(/^\d\d$/);
        
        const [row, col] = [parseInt(location[0]), parseInt(location[1])];
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(10);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(10);
      });

      test('should not repeat moves', async () => {
        const moves = new Set();
        
        // Make several moves and ensure no duplicates
        for (let i = 0; i < 10; i++) {
          const move = await cpuPlayer.makeMove();
          expect(moves.has(move)).toBe(false);
          moves.add(move);
          cpuPlayer.opponentBoard.receiveAttack(move); // Record the move
        }
      });

      test('should use target queue when in target mode', async () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = ['34', '35'];
        
        const move = await cpuPlayer.makeMove();
        expect(move).toBe('34');
        expect(cpuPlayer.targetQueue).toEqual(['35']);
      });

      test('should switch to hunt mode when target queue is empty', async () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = [];
        
        await cpuPlayer.makeMove();
        expect(cpuPlayer.mode).toBe('hunt');
      });

      test('should handle already guessed location in target mode and retry', async () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = ['34', '35'];
        
        // Mark first target as already guessed
        cpuPlayer.opponentBoard.receiveAttack('34');
        
        const move = await cpuPlayer.makeMove();
        expect(move).toBe('35');
        expect(cpuPlayer.targetQueue).toEqual([]);
      });

      test('should switch to hunt mode when target queue becomes empty after skipping guessed locations', async () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = ['34'];
        
        // Mark target as already guessed
        cpuPlayer.opponentBoard.receiveAttack('34');
        
        const move = await cpuPlayer.makeMove();
        expect(cpuPlayer.mode).toBe('hunt');
        expect(move).toMatch(/^\d\d$/);
      });
    });

    describe('huntMove', () => {
      test('should generate valid hunt move', () => {
        const location = cpuPlayer.huntMove();
        expect(location).toMatch(/^\d\d$/);
      });

      test('should avoid already guessed locations', () => {
        // Fill most of the board
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 10; j++) {
            cpuPlayer.opponentBoard.receiveAttack(`${i}${j}`);
          }
        }
        
        const location = cpuPlayer.huntMove();
        expect(location).toMatch(/^9\d$/); // Should be in row 9
      });

      test('should use fallback mechanism when random attempts fail', () => {
        // Fill the entire board except one location
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (i !== 9 || j !== 9) { // Leave 99 open
              cpuPlayer.opponentBoard.receiveAttack(`${i}${j}`);
            }
          }
        }

        // Mock Math.random to always return values that would generate already guessed locations
        const originalRandom = Math.random;
        Math.random = jest.fn(() => 0.1); // This should generate locations that are already guessed

        const location = cpuPlayer.huntMove();
        expect(location).toBe('99'); // Should find the only remaining location

        // Restore original Math.random
        Math.random = originalRandom;
      });

      test('should handle edge case when board is completely full', () => {
        // Fill the entire board
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            cpuPlayer.opponentBoard.receiveAttack(`${i}${j}`);
          }
        }

        const location = cpuPlayer.huntMove();
        // Should still return a location even if all are guessed (edge case)
        expect(location).toMatch(/^\d\d$/);
      });
    });

    describe('processAttackResult', () => {
      test('should switch to target mode on hit', () => {
        const result = { hit: true, sunk: false };
        cpuPlayer.processAttackResult('45', result);
        
        expect(cpuPlayer.mode).toBe('target');
        expect(cpuPlayer.lastHit).toBe('45');
        expect(cpuPlayer.targetQueue.length).toBeGreaterThan(0);
      });

      test('should return to hunt mode when ship is sunk', () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = ['34', '35'];
        
        const result = { hit: true, sunk: true };
        cpuPlayer.processAttackResult('44', result);
        
        expect(cpuPlayer.mode).toBe('hunt');
        expect(cpuPlayer.targetQueue).toEqual([]);
      });

      test('should stay in hunt mode on miss during hunt', () => {
        cpuPlayer.mode = 'hunt';
        const result = { hit: false };
        cpuPlayer.processAttackResult('44', result);
        
        expect(cpuPlayer.mode).toBe('hunt');
      });

      test('should switch to hunt mode on miss when target queue empty', () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = [];
        
        const result = { hit: false };
        cpuPlayer.processAttackResult('44', result);
        
        expect(cpuPlayer.mode).toBe('hunt');
      });

      test('should stay in target mode on miss when target queue has items', () => {
        cpuPlayer.mode = 'target';
        cpuPlayer.targetQueue = ['34', '35'];
        
        const result = { hit: false };
        cpuPlayer.processAttackResult('44', result);
        
        expect(cpuPlayer.mode).toBe('target');
        expect(cpuPlayer.targetQueue).toEqual(['34', '35']);
      });
    });

    describe('addAdjacentTargets', () => {
      test('should add valid adjacent locations to queue', () => {
        cpuPlayer.addAdjacentTargets('44');
        
        const expectedAdjacent = ['34', '54', '43', '45'];
        expectedAdjacent.forEach(location => {
          expect(cpuPlayer.targetQueue).toContain(location);
        });
      });

      test('should not add out-of-bounds locations', () => {
        cpuPlayer.addAdjacentTargets('00');
        
        // Should not contain negative coordinates
        expect(cpuPlayer.targetQueue).not.toContain('-10');
        expect(cpuPlayer.targetQueue).not.toContain('0-1');
      });

      test('should not add already guessed locations', () => {
        cpuPlayer.opponentBoard.receiveAttack('34');
        cpuPlayer.addAdjacentTargets('44');
        
        expect(cpuPlayer.targetQueue).not.toContain('34');
      });

      test('should not add duplicate locations', () => {
        cpuPlayer.targetQueue = ['45'];
        cpuPlayer.addAdjacentTargets('44');
        
        const count45 = cpuPlayer.targetQueue.filter(loc => loc === '45').length;
        expect(count45).toBe(1);
      });

      test('should handle edge coordinates correctly', () => {
        cpuPlayer.addAdjacentTargets('99'); // Bottom-right corner
        
        // Should only add valid adjacent locations
        expect(cpuPlayer.targetQueue).toContain('89'); // Up
        expect(cpuPlayer.targetQueue).toContain('98'); // Left
        expect(cpuPlayer.targetQueue).not.toContain('109'); // Invalid down
        expect(cpuPlayer.targetQueue).not.toContain('910'); // Invalid right
      });
    });

    describe('isValidTarget', () => {
      test('should return true for valid coordinates', () => {
        expect(cpuPlayer.isValidTarget(5, 5)).toBe(true);
        expect(cpuPlayer.isValidTarget(0, 0)).toBe(true);
        expect(cpuPlayer.isValidTarget(9, 9)).toBe(true);
      });

      test('should return false for out-of-bounds coordinates', () => {
        expect(cpuPlayer.isValidTarget(-1, 5)).toBe(false);
        expect(cpuPlayer.isValidTarget(5, -1)).toBe(false);
        expect(cpuPlayer.isValidTarget(10, 5)).toBe(false);
        expect(cpuPlayer.isValidTarget(5, 10)).toBe(false);
      });

      test('should return false for already guessed locations', () => {
        cpuPlayer.opponentBoard.receiveAttack('55');
        expect(cpuPlayer.isValidTarget(5, 5)).toBe(false);
      });
    });

    describe('getMode', () => {
      test('should return current mode', () => {
        expect(cpuPlayer.getMode()).toBe('hunt');
        
        cpuPlayer.mode = 'target';
        expect(cpuPlayer.getMode()).toBe('target');
      });
    });
  });
}); 