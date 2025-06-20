const fs = require('fs').promises;
const path = require('path');
const { generateTimestamp } = require('./utils');

class FileManager {
  constructor(config) {
    this.config = config;
  }

  /**
   * Save transcription to markdown file
   * @param {string} transcript 
   * @param {string} audioFileName 
   * @param {Object} metadata 
   * @returns {Promise<string>} File path
   */
  async saveTranscription(transcript, audioFileName, metadata = {}) {
    const timestamp = generateTimestamp();
    const fileName = `${this.config.output.transcriptionPrefix}${timestamp}${this.config.output.transcriptionExt}`;
    
    const content = this.formatTranscription(transcript, audioFileName, metadata);
    
    await fs.writeFile(fileName, content, 'utf8');
    console.log(`💾 Transcription saved: ${fileName}`);
    
    return fileName;
  }

  /**
   * Save summary to markdown file
   * @param {string} summary 
   * @param {string} audioFileName 
   * @param {Object} metadata 
   * @returns {Promise<string>} File path
   */
  async saveSummary(summary, audioFileName, metadata = {}) {
    const timestamp = generateTimestamp();
    const fileName = `${this.config.output.summaryPrefix}${timestamp}${this.config.output.summaryExt}`;
    
    const content = this.formatSummary(summary, audioFileName, metadata);
    
    await fs.writeFile(fileName, content, 'utf8');
    console.log(`💾 Summary saved: ${fileName}`);
    
    return fileName;
  }

  /**
   * Save analytics to JSON file
   * @param {Object} analytics 
   * @param {string} audioFileName 
   * @param {Object} metadata 
   * @returns {Promise<string>} File path
   */
  async saveAnalytics(analytics, audioFileName, metadata = {}) {
    const timestamp = generateTimestamp();
    const fileName = `${this.config.output.analysisPrefix}${timestamp}${this.config.output.analysisExt}`;
    
    const content = {
      metadata: {
        source_file: audioFileName,
        processed_at: new Date().toISOString(),
        ...metadata
      },
      analytics: analytics
    };
    
    await fs.writeFile(fileName, JSON.stringify(content, null, 2), 'utf8');
    console.log(`💾 Analytics saved: ${fileName}`);
    
    return fileName;
  }

  /**
   * Format transcription content for markdown
   * @param {string} transcript 
   * @param {string} audioFileName 
   * @param {Object} metadata 
   * @returns {string}
   */
  formatTranscription(transcript, audioFileName, metadata) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `# Audio Transcription

## File Information
- **Source File:** ${audioFileName}
- **Processed:** ${date} at ${time}
- **Duration:** ${metadata.duration ? `${Math.round(metadata.duration)} seconds` : 'Unknown'}
- **File Size:** ${metadata.fileSize ? `${metadata.fileSize} MB` : 'Unknown'}

## Transcript

${transcript}

---
*Transcribed using OpenAI Whisper API*`;
  }

  /**
   * Format summary content for markdown
   * @param {string} summary 
   * @param {string} audioFileName 
   * @param {Object} metadata 
   * @returns {string}
   */
  formatSummary(summary, audioFileName, metadata) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `# Audio Summary

## File Information
- **Source File:** ${audioFileName}
- **Processed:** ${date} at ${time}
- **Duration:** ${metadata.duration ? `${Math.round(metadata.duration)} seconds` : 'Unknown'}
- **Word Count:** ${metadata.wordCount || 'Unknown'}

## Summary

${summary}

---
*Summary generated using OpenAI GPT-4.1-mini*`;
  }

  /**
   * Create sample output files
   * @param {string} transcript 
   * @param {string} summary 
   * @param {Object} analytics 
   * @returns {Promise<void>}
   */
  async createSampleFiles(transcript, summary, analytics) {
    // Create sample transcription
    const transcriptionContent = `# Audio Transcription

## File Information
- **Source File:** CAR0004.mp3
- **Processed:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
- **Duration:** 60 seconds
- **File Size:** 2.3 MB

## Transcript

${transcript}

---
*Transcribed using OpenAI Whisper API*`;

    // Create sample summary
    const summaryContent = `# Audio Summary

## File Information
- **Source File:** CAR0004.mp3
- **Processed:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
- **Duration:** 60 seconds
- **Word Count:** ${analytics.word_count}

## Summary

${summary}

---
*Summary generated using OpenAI GPT-4.1-mini*`;

    // Save sample files
    await fs.writeFile('transcription.md', transcriptionContent, 'utf8');
    await fs.writeFile('summary.md', summaryContent, 'utf8');
    await fs.writeFile('analysis.json', JSON.stringify(analytics, null, 2), 'utf8');
    
    console.log('📄 Sample files created: transcription.md, summary.md, analysis.json');
  }
}

module.exports = FileManager; 