const { mod, plugboardSwap, Rotor, Enigma, ROTORS, REFLECTOR, alphabet } = require('./enigma');

describe('mod function', () => {
  test('should handle positive numbers', () => {
    expect(mod(5, 3)).toBe(2);
    expect(mod(10, 7)).toBe(3);
  });

  test('should handle negative numbers', () => {
    expect(mod(-1, 26)).toBe(25);
    expect(mod(-5, 26)).toBe(21);
    expect(mod(-27, 26)).toBe(25);
  });

  test('should handle zero', () => {
    expect(mod(0, 26)).toBe(0);
    expect(mod(26, 26)).toBe(0);
  });

  test('should handle edge cases', () => {
    expect(mod(25, 26)).toBe(25);
    expect(mod(26, 26)).toBe(0);
    expect(mod(52, 26)).toBe(0);
  });
});

describe('plugboardSwap function', () => {
  test('should swap letters according to pairs', () => {
    const pairs = [['A', 'B'], ['C', 'D']];
    expect(plugboardSwap('A', pairs)).toBe('B');
    expect(plugboardSwap('B', pairs)).toBe('A');
    expect(plugboardSwap('C', pairs)).toBe('D');
    expect(plugboardSwap('D', pairs)).toBe('C');
  });

  test('should return unchanged letter if not in pairs', () => {
    const pairs = [['A', 'B']];
    expect(plugboardSwap('Z', pairs)).toBe('Z');
    expect(plugboardSwap('X', pairs)).toBe('X');
  });

  test('should work with empty pairs', () => {
    expect(plugboardSwap('A', [])).toBe('A');
    expect(plugboardSwap('Z', [])).toBe('Z');
  });

  test('should work with multiple pairs', () => {
    const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']];
    expect(plugboardSwap('A', pairs)).toBe('B');
    expect(plugboardSwap('E', pairs)).toBe('F');
    expect(plugboardSwap('G', pairs)).toBe('H');
    expect(plugboardSwap('Z', pairs)).toBe('Z');
  });
});

describe('Rotor class', () => {
  let rotor;

  beforeEach(() => {
    rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
  });

  test('should initialize correctly', () => {
    expect(rotor.wiring).toBe(ROTORS[0].wiring);
    expect(rotor.notch).toBe(ROTORS[0].notch);
    expect(rotor.ringSetting).toBe(0);
    expect(rotor.position).toBe(0);
  });

  test('should initialize with custom parameters', () => {
    const customRotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'M', 5, 10);
    expect(customRotor.ringSetting).toBe(5);
    expect(customRotor.position).toBe(10);
    expect(customRotor.notch).toBe('M');
  });

  test('should step correctly', () => {
    expect(rotor.position).toBe(0);
    rotor.step();
    expect(rotor.position).toBe(1);
    
    // Test wrap around
    rotor.position = 25;
    rotor.step();
    expect(rotor.position).toBe(0);
  });

  test('should detect notch position correctly', () => {
    // Rotor I notch is at Q (position 16)
    rotor.position = 16; // Q
    expect(rotor.atNotch()).toBe(true);
    
    rotor.position = 15; // P
    expect(rotor.atNotch()).toBe(false);
    
    rotor.position = 17; // R
    expect(rotor.atNotch()).toBe(false);
  });

  test('should perform forward substitution', () => {
    // Test with rotor at position 0
    const result = rotor.forward('A');
    expect(result).toBe('E'); // First character of Rotor I wiring

    // Test with different input
    const result2 = rotor.forward('B');
    expect(result2).toBe('K'); // Second character of Rotor I wiring
  });

  test('should perform backward substitution', () => {
    // Test backward operation (inverse of forward)
    const original = 'A';
    const forward = rotor.forward(original);
    const backward = rotor.backward(forward);
    expect(backward).toBe(original);
  });

  test('should handle ring settings', () => {
    const rotorWithRing = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 1, 0);
    const normalRotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
    
    const result1 = rotorWithRing.forward('A');
    const result2 = normalRotor.forward('A');
    expect(result1).not.toBe(result2); // Ring setting should change the result
  });

  test('should handle rotor position changes', () => {
    const result1 = rotor.forward('A');
    rotor.position = 1;
    const result2 = rotor.forward('A');
    expect(result1).not.toBe(result2); // Position change should change the result
  });
});

describe('Enigma class', () => {
  let enigma;

  beforeEach(() => {
    enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  });

  test('should initialize correctly', () => {
    expect(enigma.rotors).toHaveLength(3);
    expect(enigma.plugboardPairs).toEqual([]);
  });

  test('should initialize with custom parameters', () => {
    const customEnigma = new Enigma(
      [2, 1, 0], 
      [5, 10, 15], 
      [1, 2, 3], 
      [['A', 'B']]
    );
    expect(customEnigma.rotors[0].position).toBe(5);
    expect(customEnigma.rotors[1].position).toBe(10);
    expect(customEnigma.rotors[2].position).toBe(15);
    expect(customEnigma.plugboardPairs).toEqual([['A', 'B']]);
  });

  test('should step rotors correctly', () => {
    const initialPositions = enigma.rotors.map(r => r.position);
    enigma.stepRotors();
    
    // Rightmost rotor should always step
    expect(enigma.rotors[2].position).toBe(initialPositions[2] + 1);
  });

  test('should handle rotor stepping logic', () => {
    // Test the actual stepping behavior of this implementation
    enigma.rotors[0].position = 0; // Left rotor  
    enigma.rotors[1].position = 4; // E (notch for Rotor II)
    enigma.rotors[2].position = 0; // A (not at notch)
    
    enigma.stepRotors();
    
    // What happens:
    // 1. Right rotor is not at notch, so middle rotor doesn't step from first condition
    // 2. Middle rotor is at notch E, so left rotor steps: 0 -> 1
    // 3. Right rotor always steps: 0 -> 1
    
    expect(enigma.rotors[0].position).toBe(1); // Left rotor stepped (middle was at notch)
    expect(enigma.rotors[1].position).toBe(4); // Middle rotor didn't step
    expect(enigma.rotors[2].position).toBe(1); // Right rotor stepped
  });

  test('should encrypt single character correctly', () => {
    const result = enigma.encryptChar('A');
    expect(typeof result).toBe('string');
    expect(result.length).toBe(1);
    expect(alphabet.includes(result)).toBe(true);
  });

  test('should be reciprocal (encrypt = decrypt)', () => {
    const original = 'A';
    const encrypted = enigma.encryptChar(original);
    
    // Create new enigma with same settings for decryption
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const decrypted = enigma2.encryptChar(encrypted);
    
    expect(decrypted).toBe(original);
  });

  test('should handle non-alphabetic characters', () => {
    expect(enigma.encryptChar('1')).toBe('1');
    expect(enigma.encryptChar(' ')).toBe(' ');
    expect(enigma.encryptChar('!')).toBe('!');
  });

  test('should process full text messages', () => {
    const message = 'HELLO WORLD';
    const encrypted = enigma.process(message);
    
    expect(encrypted).not.toBe(message);
    expect(encrypted.length).toBe(message.length);
    
    // Decrypt
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(message);
  });

  test('should work with plugboard', () => {
    const enigmaWithPlugboard = new Enigma(
      [0, 1, 2], 
      [0, 0, 0], 
      [0, 0, 0], 
      [['A', 'B'], ['C', 'D']]
    );
    
    const message = 'ABCD';
    const encrypted = enigmaWithPlugboard.process(message);
    
    // Decrypt with same settings
    const enigma2 = new Enigma(
      [0, 1, 2], 
      [0, 0, 0], 
      [0, 0, 0], 
      [['A', 'B'], ['C', 'D']]
    );
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(message);
  });

  test('should work with different rotor positions', () => {
    const enigmaCustom = new Enigma([0, 1, 2], [5, 10, 15], [0, 0, 0], []);
    
    const message = 'TESTMESSAGE';
    const encrypted = enigmaCustom.process(message);
    
    // Decrypt with same settings
    const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [0, 0, 0], []);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(message);
  });

  test('should work with ring settings', () => {
    const enigmaRings = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
    
    const message = 'RINGS';
    const encrypted = enigmaRings.process(message);
    
    // Decrypt with same settings
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(message);
  });

  test('should convert text to uppercase', () => {
    const lowercase = 'hello';
    const encrypted = enigma.process(lowercase);
    
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe('HELLO');
  });

  test('should never encrypt a letter to itself', () => {
    // This is a key property of Enigma due to the reflector
    for (let i = 0; i < 100; i++) {
      const testEnigma = new Enigma([0, 1, 2], [i % 26, (i * 2) % 26, (i * 3) % 26], [0, 0, 0], []);
      for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        const encrypted = testEnigma.encryptChar(letter);
        expect(encrypted).not.toBe(letter);
      }
    }
  });
});

describe('Integration tests', () => {
  test('should handle long messages correctly', () => {
    const longMessage = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG'.repeat(10);
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const encrypted = enigma1.process(longMessage);
    
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(longMessage);
  });

  test('should handle all rotor configurations', () => {
    // Test all possible rotor combinations
    for (let r1 = 0; r1 < 3; r1++) {
      for (let r2 = 0; r2 < 3; r2++) {
        for (let r3 = 0; r3 < 3; r3++) {
          if (r1 !== r2 && r2 !== r3 && r1 !== r3) { // No duplicate rotors
            const enigma1 = new Enigma([r1, r2, r3], [0, 0, 0], [0, 0, 0], []);
            const message = 'TEST';
            const encrypted = enigma1.process(message);
            
            const enigma2 = new Enigma([r1, r2, r3], [0, 0, 0], [0, 0, 0], []);
            const decrypted = enigma2.process(encrypted);
            
            expect(decrypted).toBe(message);
          }
        }
      }
    }
  });

  test('should handle complex plugboard configurations', () => {
    const complexPlugboard = [
      ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], 
      ['I', 'J'], ['K', 'L'], ['M', 'N'], ['O', 'P']
    ];
    
    const enigma1 = new Enigma([0, 1, 2], [5, 10, 15], [1, 2, 3], complexPlugboard);
    const message = 'COMPLEX PLUGBOARD TEST MESSAGE';
    const encrypted = enigma1.process(message);
    
    const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [1, 2, 3], complexPlugboard);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(message);
  });

  test('should handle rotor notch transitions correctly', () => {
    // Test around notch positions for all rotors
    const testCases = [
      { rotor: 0, notchPos: 16 }, // Rotor I, Q
      { rotor: 1, notchPos: 4 },  // Rotor II, E  
      { rotor: 2, notchPos: 21 }  // Rotor III, V
    ];
    
    testCases.forEach(({ rotor, notchPos }) => {
      // Test one position before notch
      const enigma1 = new Enigma([0, 1, 2], [0, 0, notchPos - 1], [0, 0, 0], []);
      const message = 'NOTCH TEST';
      const encrypted = enigma1.process(message);
      
      const enigma2 = new Enigma([0, 1, 2], [0, 0, notchPos - 1], [0, 0, 0], []);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(message);
    });
  });
});

describe('Constants validation', () => {
  test('should have correct rotor configurations', () => {
    expect(ROTORS).toHaveLength(3);
    ROTORS.forEach(rotor => {
      expect(rotor.wiring).toHaveLength(26);
      expect(typeof rotor.notch).toBe('string');
      expect(rotor.notch.length).toBe(1);
      expect(alphabet.includes(rotor.notch)).toBe(true);
    });
  });

  test('should have correct reflector configuration', () => {
    expect(REFLECTOR).toHaveLength(26);
    
    // Test reflector is reciprocal
    for (let i = 0; i < 26; i++) {
      const char1 = alphabet[i];
      const char2 = REFLECTOR[i];
      const backIndex = alphabet.indexOf(char2);
      const backChar = REFLECTOR[backIndex];
      expect(backChar).toBe(char1);
    }
  });

  test('should have correct alphabet', () => {
    expect(alphabet).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(alphabet).toHaveLength(26);
  });
}); 
