const fs = require('fs').promises;
const path = require('path');

/**
 * Generate a timestamp string for file naming
 * @returns {string} Timestamp in format YYYYMMDD_HHMMSS
 */
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Simple progress spinner
 */
class ProgressSpinner {
  constructor(message = 'Processing...') {
    this.message = message;
    this.chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.index = 0;
    this.interval = null;
  }

  start() {
    process.stdout.write(`${this.message} ${this.chars[0]}`);
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.message} ${this.chars[this.index]}`);
      this.index = (this.index + 1) % this.chars.length;
    }, 100);
  }

  stop(finalMessage = null) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r${finalMessage || this.message} ✓\n`);
  }

  fail(errorMessage = null) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r${errorMessage || this.message} ✗\n`);
  }
}

/**
 * Check if a file exists and is readable
 * @param {string} filePath 
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in MB
 * @param {string} filePath 
 * @returns {Promise<number>}
 */
async function getFileSizeMB(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch {
    return 0;
  }
}

/**
 * Calculate speaking speed in words per minute
 * @param {string} transcript 
 * @param {number} durationSeconds 
 * @returns {number}
 */
function calculateWPM(transcript, durationSeconds) {
  const words = transcript.trim().split(/\s+/).length;
  const minutes = durationSeconds / 60;
  return Math.round(words / minutes * 10) / 10; // Round to 1 decimal place
}

/**
 * Count words in text
 * @param {string} text 
 * @returns {number}
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

module.exports = {
  generateTimestamp,
  ProgressSpinner,
  fileExists,
  getFileSizeMB,
  calculateWPM,
  countWords
}; 