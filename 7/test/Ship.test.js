import Ship from '../src/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  describe('constructor', () => {
    test('should create a ship with default length of 3', () => {
      expect(ship.length).toBe(3);
      expect(ship.locations).toEqual([]);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should create a ship with custom length', () => {
      const customShip = new Ship(5);
      expect(customShip.length).toBe(5);
      expect(customShip.hits).toEqual([false, false, false, false, false]);
    });
  });

  describe('place', () => {
    test('should place ship at specified locations', () => {
      const locations = ['00', '01', '02'];
      ship.place(locations);
      expect(ship.locations).toEqual(locations);
    });

    test('should throw error if wrong number of locations provided', () => {
      expect(() => ship.place(['00', '01'])).toThrow('Ship requires exactly 3 locations');
      expect(() => ship.place(['00', '01', '02', '03'])).toThrow('Ship requires exactly 3 locations');
    });

    test('should create a copy of locations array', () => {
      const locations = ['00', '01', '02'];
      ship.place(locations);
      locations.push('03');
      expect(ship.locations).toEqual(['00', '01', '02']);
    });
  });

  describe('hit', () => {
    beforeEach(() => {
      ship.place(['00', '01', '02']);
    });

    test('should return true and mark hit when hitting valid location', () => {
      expect(ship.hit('01')).toBe(true);
      expect(ship.hits[1]).toBe(true);
    });

    test('should return false when hitting invalid location', () => {
      expect(ship.hit('99')).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should return false when hitting already hit location', () => {
      ship.hit('01');
      expect(ship.hit('01')).toBe(false);
    });

    test('should handle multiple hits correctly', () => {
      expect(ship.hit('00')).toBe(true);
      expect(ship.hit('02')).toBe(true);
      expect(ship.hits).toEqual([true, false, true]);
    });
  });

  describe('isSunk', () => {
    beforeEach(() => {
      ship.place(['00', '01', '02']);
    });

    test('should return false when ship is not completely hit', () => {
      expect(ship.isSunk()).toBe(false);
      ship.hit('00');
      expect(ship.isSunk()).toBe(false);
      ship.hit('01');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all parts are hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });

    test('should return true for newly created ship with no locations', () => {
      const emptyShip = new Ship(0);
      emptyShip.place([]);
      expect(emptyShip.isSunk()).toBe(true);
    });
  });

  describe('hasLocation', () => {
    beforeEach(() => {
      ship.place(['00', '01', '02']);
    });

    test('should return true for valid ship locations', () => {
      expect(ship.hasLocation('00')).toBe(true);
      expect(ship.hasLocation('01')).toBe(true);
      expect(ship.hasLocation('02')).toBe(true);
    });

    test('should return false for invalid locations', () => {
      expect(ship.hasLocation('99')).toBe(false);
      expect(ship.hasLocation('10')).toBe(false);
    });
  });

  describe('getLocations', () => {
    test('should return copy of locations array', () => {
      const locations = ['00', '01', '02'];
      ship.place(locations);
      const returned = ship.getLocations();
      
      expect(returned).toEqual(locations);
      expect(returned).not.toBe(ship.locations); // Different reference
      
      returned.push('03');
      expect(ship.locations).toEqual(['00', '01', '02']); // Original unchanged
    });

    test('should return empty array for unplaced ship', () => {
      expect(ship.getLocations()).toEqual([]);
    });
  });

  describe('isHitAt', () => {
    beforeEach(() => {
      ship.place(['00', '01', '02']);
    });

    test('should return true for hit locations', () => {
      ship.hit('01');
      expect(ship.isHitAt('01')).toBe(true);
    });

    test('should return false for unhit locations that belong to ship', () => {
      expect(ship.isHitAt('00')).toBe(false);
      expect(ship.isHitAt('02')).toBe(false);
    });

    test('should return false for locations not on ship', () => {
      expect(ship.isHitAt('99')).toBe(false);
    });
  });
}); 