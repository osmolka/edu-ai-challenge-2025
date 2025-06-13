import Game from '../src/Game.js';
import { jest } from '@jest/globals';

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
    
    // Create spies on all UI methods to make them mockable
    jest.spyOn(game.ui, 'init').mockImplementation(() => {});
    jest.spyOn(game.ui, 'close').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayMessage').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayShipsPlaced').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayIntro').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayBoards').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayStatus').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayError').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayAttackResult').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayCPUTurn').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayCPUTarget').mockImplementation(() => {});
    jest.spyOn(game.ui, 'displayGameOver').mockImplementation(() => {});
    jest.spyOn(game.ui, 'getInput').mockResolvedValue('00');
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('should create game with default parameters', () => {
      expect(game.boardSize).toBe(10);
      expect(game.numShips).toBe(3);
      expect(game.shipLength).toBe(3);
      expect(game.humanPlayer).toBeDefined();
      expect(game.cpuPlayer).toBeDefined();
      expect(game.ui).toBeDefined();
      expect(game.currentPlayer).toBe(game.humanPlayer);
      expect(game.isGameOver).toBe(false);
    });

    test('should create game with custom parameters', () => {
      const customGame = new Game(8, 2, 4);
      expect(customGame.boardSize).toBe(8);
      expect(customGame.numShips).toBe(2);
      expect(customGame.shipLength).toBe(4);
    });
  });

  describe('start', () => {
    test('should handle errors during game initialization', async () => {
      // Mock setupGame to throw an error
      jest.spyOn(game, 'setupGame').mockRejectedValue(new Error('Setup failed'));
      
      await game.start();
      
      expect(game.ui.displayError).toHaveBeenCalledWith('Game error: Setup failed');
      expect(game.ui.close).toHaveBeenCalled();
    });

    test('should handle errors during game loop', async () => {
      jest.spyOn(game, 'setupGame').mockResolvedValue();
      jest.spyOn(game, 'gameLoop').mockRejectedValue(new Error('Game loop failed'));
      
      await game.start();
      
      expect(game.ui.displayError).toHaveBeenCalledWith('Game error: Game loop failed');
      expect(game.ui.close).toHaveBeenCalled();
    });

    test('should always close UI even if no error occurs', async () => {
      jest.spyOn(game, 'setupGame').mockResolvedValue();
      jest.spyOn(game, 'gameLoop').mockResolvedValue();
      
      await game.start();
      
      expect(game.ui.close).toHaveBeenCalled();
    });
  });

  describe('setupGame', () => {
    test('should set up boards and ships for both players', async () => {
      await game.setupGame();
      
      expect(game.humanPlayer.board.ships.length).toBe(3);
      expect(game.cpuPlayer.board.ships.length).toBe(3);
      expect(game.humanPlayer.opponentBoard).toBe(game.cpuPlayer.board);
      expect(game.cpuPlayer.opponentBoard).toBe(game.humanPlayer.board);
    });
  });

  describe('gameLoop', () => {
    test('should handle complete game flow until victory', async () => {
      // Mock a quick game scenario
      game.humanPlayer.setupBoard(1, 3, true);
      game.cpuPlayer.setupBoard(1, 3, false);

      let turnCount = 0;
      jest.spyOn(game, 'checkGameOver').mockImplementation(() => {
        turnCount++;
        if (turnCount >= 2) {
          game.isGameOver = true;
          game.winner = game.humanPlayer;
          return true;
        }
        return false;
      });

      jest.spyOn(game, 'processHumanTurn').mockResolvedValue();
      jest.spyOn(game, 'processCPUTurn').mockResolvedValue();
      jest.spyOn(game, 'endGame').mockImplementation(() => {});

      await game.gameLoop();

      expect(game.ui.displayBoards).toHaveBeenCalled();
      expect(game.ui.displayStatus).toHaveBeenCalled();
      expect(game.endGame).toHaveBeenCalled();
    });
  });

  describe('checkGameOver', () => {
    test('should return false when no one has lost', () => {
      game.humanPlayer.setupBoard(1, 3, true);
      game.cpuPlayer.setupBoard(1, 3, false);
      
      expect(game.checkGameOver()).toBe(false);
      expect(game.isGameOver).toBe(false);
    });

    test('should detect human player loss', () => {
      game.humanPlayer.setupBoard(1, 3, true);
      game.cpuPlayer.setupBoard(1, 3, false);
      
      // Sink all human player ships
      const humanShip = game.humanPlayer.board.ships[0];
      humanShip.hit(humanShip.locations[0]);
      humanShip.hit(humanShip.locations[1]);
      humanShip.hit(humanShip.locations[2]);
      
      expect(game.checkGameOver()).toBe(true);
      expect(game.isGameOver).toBe(true);
      expect(game.winner).toBe(game.cpuPlayer);
    });

    test('should detect CPU player loss', () => {
      game.humanPlayer.setupBoard(1, 3, true);
      game.cpuPlayer.setupBoard(1, 3, false);
      
      // Sink all CPU player ships
      const cpuShip = game.cpuPlayer.board.ships[0];
      cpuShip.hit(cpuShip.locations[0]);
      cpuShip.hit(cpuShip.locations[1]);
      cpuShip.hit(cpuShip.locations[2]);
      
      expect(game.checkGameOver()).toBe(true);
      expect(game.isGameOver).toBe(true);
      expect(game.winner).toBe(game.humanPlayer);
    });
  });

  describe('getGameStats', () => {
    test('should return correct game statistics', () => {
      game.humanPlayer.setupBoard(2, 3, true);
      game.cpuPlayer.setupBoard(2, 3, false);
      
      // Simulate some moves
      game.humanPlayer.opponentBoard.receiveAttack('00');
      game.cpuPlayer.opponentBoard.receiveAttack('11');
      
      const stats = game.getGameStats();
      
      expect(stats.totalTurns).toBe(2);
      expect(stats.playerGuesses).toBe(1);
      expect(stats.cpuGuesses).toBe(1);
      expect(stats.playerShipsRemaining).toBe(2);
      expect(stats.cpuShipsRemaining).toBe(2);
      expect(stats.winner).toBe(null);
    });

    test('should include winner in stats when game is over', () => {
      game.winner = game.humanPlayer;
      const stats = game.getGameStats();
      expect(stats.winner).toBe('Player');
    });

    test('should handle case when winner is null', () => {
      game.winner = null;
      const stats = game.getGameStats();
      expect(stats.winner).toBe(null);
    });
  });

  describe('reset', () => {
    test('should reset game state', () => {
      game.isGameOver = true;
      game.winner = game.humanPlayer;
      game.currentPlayer = game.cpuPlayer;
      
      game.reset();
      
      expect(game.isGameOver).toBe(false);
      expect(game.winner).toBe(null);
      expect(game.currentPlayer).toBe(game.humanPlayer);
      expect(game.humanPlayer).toBeDefined();
      expect(game.cpuPlayer).toBeDefined();
    });
  });

  describe('processHumanTurn', () => {
    beforeEach(() => {
      game.humanPlayer.setupBoard(1, 3, true);
      game.cpuPlayer.setupBoard(1, 3, false);
      
      // Mock validateInput to return valid
      jest.spyOn(game.humanPlayer, 'validateInput').mockReturnValue({ valid: true });
      
      // Mock receiveAttack
      jest.spyOn(game.cpuPlayer, 'receiveAttack').mockReturnValue({
        valid: true,
        hit: false,
        sunk: false,
        message: 'Miss!'
      });
    });

    test('should process valid human turn', async () => {
      await game.processHumanTurn();
      
      expect(game.ui.getInput).toHaveBeenCalledWith('Enter your guess (e.g., 00): ');
      expect(game.humanPlayer.validateInput).toHaveBeenCalledWith('00', 10);
      expect(game.cpuPlayer.receiveAttack).toHaveBeenCalledWith('00');
      expect(game.currentPlayer).toBe(game.cpuPlayer);
    });

    test('should handle invalid input and retry', async () => {
      // First call returns invalid, second call returns valid
      game.humanPlayer.validateInput
        .mockReturnValueOnce({ valid: false, message: 'Invalid input' })
        .mockReturnValueOnce({ valid: true });
      
      // Clear the existing mock and set new behavior
      game.ui.getInput.mockRestore();
      game.ui.getInput = jest.fn()
        .mockResolvedValueOnce('invalid')
        .mockResolvedValueOnce('00');
      
      await game.processHumanTurn();
      
      expect(game.ui.displayError).toHaveBeenCalledWith('Invalid input');
      expect(game.ui.getInput).toHaveBeenCalledTimes(2);
    });

    test('should display sunk message when ship is hit and sunk', async () => {
      game.cpuPlayer.receiveAttack.mockReturnValue({
        valid: true,
        hit: true,
        sunk: true,
        message: 'Ship sunk!'
      });
      
      await game.processHumanTurn();
      
      expect(game.ui.displayMessage).toHaveBeenCalledWith('You sunk an enemy battleship!');
    });
  });

  describe('processCPUTurn', () => {
    beforeEach(() => {
      game.humanPlayer.setupBoard(1, 3, true);
      game.cpuPlayer.setupBoard(1, 3, false);
      
      // Mock CPU makeMove
      jest.spyOn(game.cpuPlayer, 'makeMove').mockResolvedValue('44');
      
      // Mock receiveAttack
      jest.spyOn(game.humanPlayer, 'receiveAttack').mockReturnValue({
        valid: true,
        hit: true,
        sunk: false,
        message: 'Hit!'
      });
      
      // Mock processAttackResult
      jest.spyOn(game.cpuPlayer, 'processAttackResult').mockImplementation(() => {});
      
      // Mock getMode
      jest.spyOn(game.cpuPlayer, 'getMode').mockReturnValue('hunt');
    });

    test('should process CPU turn', async () => {
      await game.processCPUTurn();
      
      expect(game.ui.displayCPUTurn).toHaveBeenCalled();
      expect(game.cpuPlayer.makeMove).toHaveBeenCalled();
      expect(game.humanPlayer.receiveAttack).toHaveBeenCalledWith('44');
      expect(game.cpuPlayer.processAttackResult).toHaveBeenCalled();
      expect(game.currentPlayer).toBe(game.humanPlayer);
    });

    test('should display targeting when CPU is in target mode', async () => {
      game.cpuPlayer.getMode.mockReturnValue('target');
      
      await game.processCPUTurn();
      
      expect(game.ui.displayCPUTarget).toHaveBeenCalledWith('44');
    });

    test('should display sunk message when ship is sunk', async () => {
      game.humanPlayer.receiveAttack.mockReturnValue({
        valid: true,
        hit: true,
        sunk: true,
        message: 'Ship sunk!'
      });
      
      await game.processCPUTurn();
      
      expect(game.ui.displayMessage).toHaveBeenCalledWith('CPU sunk your battleship!');
    });
  });

  describe('endGame', () => {
    test('should display game over screen', () => {
      game.winner = game.humanPlayer;
      game.endGame();
      
      expect(game.ui.displayBoards).toHaveBeenCalled();
      expect(game.ui.displayGameOver).toHaveBeenCalledWith(true);
    });

    test('should show CPU win', () => {
      game.winner = game.cpuPlayer;
      game.endGame();
      
      expect(game.ui.displayGameOver).toHaveBeenCalledWith(false);
    });
  });
}); 
