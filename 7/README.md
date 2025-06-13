# Modern Battleship Game

A modernized implementation of the classic Battleship game using ES6+ JavaScript features and modular architecture.

## Features

### Modern JavaScript Standards (ES6+)
- **Classes**: Object-oriented design with ES6 class syntax
- **Modules**: CommonJS module system for clear separation of concerns
- **Arrow Functions**: Concise function syntax where appropriate
- **const/let**: Block-scoped variable declarations instead of var
- **Template Literals**: String interpolation with backticks
- **Destructuring**: Clean object and array destructuring
- **Promises/async-await**: Asynchronous handling for user input

### Improved Code Structure
- **Separation of Concerns**: Clear division between game logic, UI, and data models
- **Encapsulation**: Private state management within classes, no global variables
- **Inheritance**: Base Player class with specialized HumanPlayer and CPUPlayer
- **Modular Architecture**: Each component in its own file with clear responsibilities

### Core Game Mechanics (Preserved)
- **10x10 Grid**: Standard Battleship board size
- **Turn-based Input**: Two-digit coordinate system (e.g., 00, 34)
- **Hit/Miss/Sunk Logic**: Classic Battleship rules
- **CPU AI**: Intelligent opponent with 'hunt' and 'target' modes
- **3 Ships**: Each ship is 3 units long

## Architecture

```
src/
├── Ship.js       # Ship class with hit tracking
├── GameBoard.js  # Board management and ship placement
├── Player.js     # Player classes (Human, CPU, Base)
├── UI.js         # User interface and display logic
└── Game.js       # Main game orchestration

tests/
├── Ship.test.js
├── GameBoard.test.js
├── Player.test.js
└── Game.test.js

seabattle.js      # Entry point
package.json      # Dependencies and scripts
```

### Class Responsibilities

#### Ship
- Manages ship locations and hit status
- Provides methods for placement, hitting, and sunk detection
- Encapsulates ship state without global variables

#### GameBoard
- Handles 10x10 grid management
- Manages ship placement and collision detection
- Processes attacks and tracks guesses
- Maintains board state and visualization

#### Player (Base Class)
- Common player functionality
- Board management and ship setup
- Attack processing and win/loss detection

#### HumanPlayer
- Extends Player with human-specific behavior
- Input validation and user interaction
- Async input handling

#### CPUPlayer
- Extends Player with AI behavior
- Hunt and target strategy implementation
- Adjacent cell targeting after hits

#### UI
- Console display and formatting
- Async user input collection
- Game state visualization
- Error and status messages

#### Game
- Orchestrates entire game flow
- Turn management and game loop
- Win/loss detection and statistics
- Error handling and cleanup

## Installation

1. Clone or download the game files
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Game
```bash
npm start
# or
node seabattle.js
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

## Game Instructions

1. **Starting**: Ships are automatically placed randomly for both players
2. **Input Format**: Enter coordinates as two digits (e.g., `00` for row 0, column 0)
3. **Board Display**: 
   - Left side: Opponent's board (your attacks)
   - Right side: Your board (CPU attacks)
   - `~` = Water, `S` = Your ship, `X` = Hit, `O` = Miss
4. **Winning**: Sink all enemy ships to win

## Testing

The game includes comprehensive unit tests with >60% coverage:

- **Ship Tests**: Placement, hitting, sinking logic
- **GameBoard Tests**: Grid management, attack processing
- **Player Tests**: Human input validation, CPU AI behavior
- **Game Tests**: Game flow, turn management, win conditions

Coverage includes:
- All core game mechanics
- Error handling and edge cases
- AI behavior and strategy
- User input validation
- Game state management

## ES6+ Features Used

### Classes and Inheritance
```javascript
class Ship {
  constructor(length = 3) {
    this.length = length;
    this.locations = [];
    this.hits = new Array(length).fill(false);
  }
}

class CPUPlayer extends Player {
  async makeMove() {
    // AI logic here
  }
}
```

### Async/Await
```javascript
async makeMove(getInput) {
  return await getInput();
}

async gameLoop() {
  while (!this.isGameOver) {
    await this.processHumanTurn();
    await this.processCPUTurn();
  }
}
```

### Arrow Functions and Array Methods
```javascript
createGrid() {
  return Array(this.size).fill(null).map(() => 
    Array(this.size).fill('~')
  );
}

allShipsSunk() {
  return this.ships.every(ship => ship.isSunk());
}
```

### Template Literals
```javascript
displayMessage(`Your ships: ${playerShips} | Enemy ships: ${cpuShips}`);
throw new Error(`Ship requires exactly ${this.length} locations`);
```

### Const/Let and Destructuring
```javascript
const [row, col] = this.parseLocation(location);
const { hit, sunk, message } = this.cpuPlayer.receiveAttack(input);
```

### Set and Map Usage
```javascript
this.guesses = new Set(); // No duplicate guesses
const stats = game.getGameStats(); // Object with computed properties
```

## Requirements Met

✅ **Modern ES6+ Features**: Classes, modules, async/await, arrow functions, const/let
✅ **Improved Code Structure**: Modular architecture, separation of concerns, no globals
✅ **Enhanced Maintainability**: Clear naming, consistent style, well-documented
✅ **Preserved Game Mechanics**: 10x10 grid, coordinate input, hit/miss/sunk logic, CPU AI
✅ **Comprehensive Testing**: >60% test coverage, all core functionality tested

The refactored game maintains all original functionality while demonstrating modern JavaScript best practices and clean architecture principles. 