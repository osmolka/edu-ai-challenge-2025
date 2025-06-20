#!/usr/bin/env node

const path = require('path');
const { config, validateConfig } = require('./config');
const AudioProcessor = require('./audioProcessor');
const ContentAnalyzer = require('./contentAnalyzer');
const FileManager = require('./fileManager');
const { fileExists, getFileSizeMB } = require('./utils');

class AudioTranscriptAnalyzer {
  constructor() {
    this.audioProcessor = null;
    this.contentAnalyzer = null;
    this.fileManager = null;
  }

  async initialize() {
    try {
      // Validate configuration
      validateConfig();
      
      // Initialize components
      this.audioProcessor = new AudioProcessor(config.openai.apiKey, config.openai.whisperModel);
      this.contentAnalyzer = new ContentAnalyzer(config.openai.apiKey, config.openai.gptModel);
      this.fileManager = new FileManager(config);
      
      console.log('🚀 Audio Transcript Analyzer initialized successfully');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  async processAudio(audioFilePath) {
    try {
      const startTime = Date.now();
      
      // Validate input file
      console.log('\n📋 Validating input file...');
      await this.validateInputFile(audioFilePath);
      
      const audioFileName = path.basename(audioFilePath);
      const fileSize = await getFileSizeMB(audioFilePath);
      
      console.log(`✅ File validation passed`);
      console.log(`📁 Processing: ${audioFileName} (${fileSize}MB)`);
      
      // Step 1: Transcribe audio
      console.log('\n🎵 Starting transcription...');
      const transcriptionResult = await this.audioProcessor.transcribe(audioFilePath);
      
      if (!transcriptionResult.text || transcriptionResult.text.trim().length === 0) {
        throw new Error('No transcription text received from Whisper API');
      }
      
      console.log(`✅ Transcription completed (${transcriptionResult.text.length} characters)`);
      
      // Step 2: Generate summary
      console.log('\n📝 Generating summary...');
      const summary = await this.contentAnalyzer.generateSummary(transcriptionResult.text);
      console.log('✅ Summary generated');
      
      // Step 3: Analyze content
      console.log('\n🔍 Analyzing content...');
      const analytics = await this.contentAnalyzer.generateAnalytics(
        transcriptionResult.text, 
        transcriptionResult.duration
      );
      console.log('✅ Content analysis completed');
      
      // Step 4: Save files
      console.log('\n💾 Saving results...');
      const metadata = {
        duration: transcriptionResult.duration,
        fileSize: fileSize,
        wordCount: analytics.word_count
      };
      
      await Promise.all([
        this.fileManager.saveTranscription(transcriptionResult.text, audioFileName, metadata),
        this.fileManager.saveSummary(summary, audioFileName, metadata),
        this.fileManager.saveAnalytics(analytics, audioFileName, metadata)
      ]);
      
      // Step 5: Display results
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      this.displayResults(summary, analytics, processingTime);
      
      return {
        transcript: transcriptionResult.text,
        summary,
        analytics,
        processingTime
      };
      
    } catch (error) {
      console.error('\n❌ Processing failed:', error.message);
      
      // Provide helpful error guidance
      if (error.message.includes('API key')) {
        console.error('\n💡 Tip: Make sure you have set your OPENAI_API_KEY in a .env file or environment variable');
        console.error('   Example: OPENAI_API_KEY=sk-your-api-key-here');
      } else if (error.message.includes('not found')) {
        console.error('\n💡 Tip: Check the file path and make sure the audio file exists');
      } else if (error.message.includes('format')) {
        console.error('\n💡 Tip: Supported formats: WAV, MP3, MP4, MPEG, MPGA, M4A, WEBM');
      }
      
      process.exit(1);
    }
  }

  async validateInputFile(filePath) {
    // Check if file exists
    if (!(await fileExists(filePath))) {
      throw new Error(`Audio file not found: ${filePath}`);
    }
    
    // Check file format
    if (!this.audioProcessor.isValidAudioFormat(filePath)) {
      throw new Error(`Unsupported audio format. Please use: WAV, MP3, MP4, MPEG, MPGA, M4A, or WEBM`);
    }
    
    // Check file size
    const fileSizeMB = await getFileSizeMB(filePath);
    if (fileSizeMB > 25) {
      throw new Error(`File size (${fileSizeMB}MB) exceeds OpenAI's 25MB limit`);
    }
  }

  displayResults(summary, analytics, processingTime) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PROCESSING RESULTS');
    console.log('='.repeat(80));
    
    console.log('\n📝 SUMMARY:');
    console.log('-'.repeat(40));
    console.log(summary);
    
    console.log('\n📈 ANALYTICS:');
    console.log('-'.repeat(40));
    console.log(JSON.stringify(analytics, null, 2));
    
    console.log('\n⏱️  PROCESSING TIME:', `${processingTime}s`);
    console.log('='.repeat(80));
  }

  displayHelp() {
    console.log(`
🎵 Audio Transcript Analyzer

USAGE:
  node src/main.js <audio_file_path>
  npm start <audio_file_path>
  npm run test                    # Process sample CAR0004.mp3 file

EXAMPLES:
  node src/main.js recording.mp3
  node src/main.js /path/to/audio.wav
  npm run test

SUPPORTED FORMATS:
  WAV, MP3, MP4, MPEG, MPGA, M4A, WEBM

REQUIREMENTS:
  - Node.js 18+
  - OpenAI API key set in .env file
  - Audio file under 25MB

SETUP:
  1. Copy .env.example to .env
  2. Add your OpenAI API key to .env file
  3. npm install
  4. npm start <audio_file>
`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    const analyzer = new AudioTranscriptAnalyzer();
    analyzer.displayHelp();
    process.exit(0);
  }
  
  const audioFilePath = args[0];
  
  const analyzer = new AudioTranscriptAnalyzer();
  await analyzer.initialize();
  await analyzer.processAudio(audioFilePath);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the application
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Application error:', error.message);
    process.exit(1);
  });
}

module.exports = AudioTranscriptAnalyzer; 