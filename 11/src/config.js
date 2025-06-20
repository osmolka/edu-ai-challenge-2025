const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    whisperModel: process.env.OPENAI_MODEL_WHISPER || 'whisper-1',
    gptModel: process.env.OPENAI_MODEL_GPT || 'gpt-4.1-mini'
  },
  output: {
    transcriptionPrefix: 'transcription_',
    summaryPrefix: 'summary_',
    analysisPrefix: 'analysis_',
    transcriptionExt: '.md',
    summaryExt: '.md',
    analysisExt: '.json'
  }
};

// Validate required configuration
function validateConfig() {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required. Please set it in your .env file or environment variables.');
  }
  
  if (!config.openai.apiKey.startsWith('sk-')) {
    throw new Error('Invalid OPENAI_API_KEY format. It should start with "sk-".');
  }
}

module.exports = {
  config,
  validateConfig
}; 
