/**
 * Ship class representing a battleship with locations and hit tracking
 */
class Ship {
  constructor(length = 3) {
    this.length = length;
    this.locations = [];
    this.hits = new Array(length).fill(false);
  }

  /**
   * Place the ship at specified locations
   * @param {string[]} locations - Array of location strings (e.g., ['00', '01', '02'])
   */
  place(locations) {
    if (locations.length !== this.length) {
      throw new Error(`Ship requires exactly ${this.length} locations`);
    }
    this.locations = [...locations];
  }

  /**
   * Attempt to hit the ship at a specific location
   * @param {string} location - Location string (e.g., '00')
   * @returns {boolean} True if hit, false if miss
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index !== -1 && !this.hits[index]) {
      this.hits[index] = true;
      return true;
    }
    return false;
  }

  /**
   * Check if the ship is completely sunk
   * @returns {boolean} True if all parts are hit
   */
  isSunk() {
    return this.hits.every(hit => hit);
  }

  /**
   * Check if a location belongs to this ship
   * @param {string} location - Location string
   * @returns {boolean} True if location is part of this ship
   */
  hasLocation(location) {
    return this.locations.includes(location);
  }

  /**
   * Get all locations of this ship
   * @returns {string[]} Array of location strings
   */
  getLocations() {
    return [...this.locations];
  }

  /**
   * Check if a specific location on the ship has been hit
   * @param {string} location - Location string
   * @returns {boolean} True if this location has been hit
   */
  isHitAt(location) {
    const index = this.locations.indexOf(location);
    return index !== -1 && this.hits[index];
  }
}

module.exports = Ship; 