const fs = require('fs');
const { OpenAI } = require('openai');
const { ProgressSpinner } = require('./utils');

class AudioProcessor {
  constructor(apiKey, model = 'whisper-1') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<{text: string, duration: number}>}
   */
  async transcribe(audioFilePath) {
    const spinner = new ProgressSpinner('🎵 Transcribing audio file...');
    
    try {
      spinner.start();

      // Check if file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // Get file stats for validation
      const stats = fs.statSync(audioFilePath);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > 25) {
        throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds OpenAI's 25MB limit for audio files`);
      }

      console.log(`\n📁 File: ${audioFilePath} (${fileSizeMB.toFixed(2)}MB)`);

      // Create file stream
      const audioStream = fs.createReadStream(audioFilePath);

      // Call Whisper API
      const response = await this.openai.audio.transcriptions.create({
        file: audioStream,
        model: this.model,
        response_format: 'verbose_json', // Get detailed response with duration
        timestamp_granularities: ['word']
      });

      spinner.stop('🎵 Audio transcription completed');

      // Extract text and calculate duration from words if available
      const transcript = response.text;
      let duration = response.duration || 0;

      // If we don't have duration, estimate from word timestamps
      if (!duration && response.words && response.words.length > 0) {
        const lastWord = response.words[response.words.length - 1];
        duration = lastWord.end || 0;
      }

      return {
        text: transcript,
        duration: duration,
        words: response.words || []
      };

    } catch (error) {
      spinner.fail('🎵 Audio transcription failed');
      
      // Handle specific OpenAI API errors
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
      } else if (error.code === 'model_not_found') {
        throw new Error(`Whisper model '${this.model}' not found. Please check the model name.`);
      } else if (error.message.includes('supported audio formats')) {
        throw new Error('Unsupported audio format. Please use WAV, MP3, MP4, MPEG, MPGA, M4A, or WEBM files.');
      } else if (error.message.includes('maximum context length')) {
        throw new Error('Audio file is too long. Please use a shorter audio file or split it into segments.');
      }
      
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Validate audio file format
   * @param {string} filePath 
   * @returns {boolean}
   */
  isValidAudioFormat(filePath) {
    const supportedExtensions = ['.wav', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.webm'];
    const extension = require('path').extname(filePath).toLowerCase();
    return supportedExtensions.includes(extension);
  }
}

module.exports = AudioProcessor; 