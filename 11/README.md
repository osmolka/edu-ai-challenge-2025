# 🎵 Audio Transcript Analyzer

A powerful Node.js console application that processes spoken audio files through OpenAI's Whisper API and provides comprehensive transcript analysis using GPT-4.

## ✨ Features

- **Audio Transcription**: Convert any audio file (WAV, MP3, etc.) to text using OpenAI's Whisper API
- **Intelligent Summarization**: Generate concise summaries using GPT-4
- **Content Analytics**: 
  - Word count analysis
  - Speaking speed calculation (WPM)
  - Frequently mentioned topics identification
- **Automated File Management**: Save transcripts, summaries, and analytics with timestamps
- **Progress Indicators**: Real-time feedback during processing
- **Comprehensive Error Handling**: Helpful error messages and troubleshooting guidance

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- OpenAI API key with access to Whisper and GPT-4 models
- Audio file in supported format (under 25MB)

### Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=sk-your-api-key-here
   ```

4. **Run the application**:
   ```bash
   # Process an audio file
   npm start path/to/your/audio.mp3
   
   # Or run directly with node
   node src/main.js path/to/your/audio.mp3
   
   # Test with sample file
   npm run test
   ```

## 📖 Detailed Usage

### Command Line Interface

```bash
# Basic usage
node src/main.js <audio_file_path>

# Examples
node src/main.js recording.mp3
node src/main.js /home/user/Documents/meeting.wav
node src/main.js "C:\\Users\\User\\Desktop\\interview.m4a"

# NPM scripts
npm start <audio_file>     # Run the application
npm run test              # Process the included sample file (CAR0004.mp3)
npm run dev <audio_file>  # Development mode (same as start)
```

### Supported Audio Formats

- **WAV** - Waveform Audio File Format
- **MP3** - MPEG Audio Layer 3
- **MP4** - MPEG-4 Audio
- **MPEG** - Moving Picture Experts Group format
- **MPGA** - MPEG Audio
- **M4A** - MPEG-4 Audio
- **WEBM** - WebM Audio

### File Size Limits

- Maximum file size: **25MB** (OpenAI API limitation)
- For larger files, consider splitting them into smaller segments

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional (with defaults)
OPENAI_MODEL_WHISPER=whisper-1
OPENAI_MODEL_GPT=gpt-4.1-mini
```

### Getting an OpenAI API Key

1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)
6. Add it to your `.env` file

**Note**: Ensure your OpenAI account has sufficient credits and access to both Whisper and GPT models.

## 📋 Output Files

The application generates three types of output files with timestamps:

### 1. Transcription File (`transcription_YYYYMMDD_HHMMSS.md`)
- Full transcript of the audio
- File metadata (source file, duration, size)
- Formatted as Markdown

### 2. Summary File (`summary_YYYYMMDD_HHMMSS.md`)
- AI-generated summary of the content
- Key insights and main points
- Formatted as Markdown

### 3. Analytics File (`analysis_YYYYMMDD_HHMMSS.json`)
- Word count
- Speaking speed (WPM)
- Frequently mentioned topics
- Processing metadata
- Formatted as JSON

## 📊 Analytics Output Format

The analytics are provided in this exact JSON format:

```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132.5,
  "frequently_mentioned_topics": [
    {
      "topic": "Customer Onboarding",
      "mentions": 6
    },
    {
      "topic": "Q4 Roadmap",
      "mentions": 4
    },
    {
      "topic": "AI Integration",
      "mentions": 3
    }
  ]
}
```

## 🎯 Example Usage

### Processing a Meeting Recording

```bash
# Process a team meeting recording
node src/main.js team_meeting_2024.mp3
```

**Console Output:**
```
🚀 Audio Transcript Analyzer initialized successfully

📋 Validating input file...
✅ File validation passed
📁 Processing: team_meeting_2024.mp3 (15.2MB)

🎵 Starting transcription...
📁 File: team_meeting_2024.mp3 (15.2MB)
🎵 Audio transcription completed ✓

📝 Generating summary...
📝 Summary generated ✓

🔍 Analyzing content...
🔍 Topic analysis completed ✓

💾 Saving results...
💾 Transcription saved: transcription_20241201_143022.md
💾 Summary saved: summary_20241201_143022.md
💾 Analytics saved: analysis_20241201_143022.json

================================================================================
📊 PROCESSING RESULTS
================================================================================

📝 SUMMARY:
----------------------------------------
## Meeting Summary

The team discussed Q4 objectives focusing on customer onboarding improvements...

📈 ANALYTICS:
----------------------------------------
{
  "word_count": 2150,
  "speaking_speed_wpm": 145.2,
  "frequently_mentioned_topics": [
    {
      "topic": "Customer Onboarding",
      "mentions": 8
    },
    {
      "topic": "Q4 Objectives",
      "mentions": 6
    }
  ]
}

⏱️  PROCESSING TIME: 23.4s
================================================================================
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "OPENAI_API_KEY is required"
- **Solution**: Create a `.env` file with your OpenAI API key
- **Check**: Ensure the key starts with `sk-`

#### 2. "Audio file not found"
- **Solution**: Verify the file path is correct
- **Check**: Use absolute paths or ensure you're in the correct directory

#### 3. "Unsupported audio format"
- **Solution**: Convert your file to a supported format (MP3, WAV, etc.)
- **Tools**: Use FFmpeg, Audacity, or online converters

#### 4. "File size exceeds 25MB limit"
- **Solution**: Split large files into smaller segments
- **Tools**: FFmpeg: `ffmpeg -i large_file.mp3 -f segment -segment_time 300 -c copy output_%03d.mp3`

#### 5. "Invalid OpenAI API key format"
- **Solution**: Double-check your API key from OpenAI platform
- **Check**: Key should start with `sk-` and be around 51 characters long

#### 6. API Rate Limits or Quota Issues
- **Solution**: Check your OpenAI account usage and billing
- **Wait**: Some rate limits reset after a short period

### Debug Mode

For additional debugging information, you can modify the source code to enable more verbose logging:

```javascript
// In src/main.js, add this at the top
process.env.DEBUG = 'true';
```

## 🔧 Development

### Project Structure

```
audio-transcript-analyzer/
├── src/
│   ├── main.js           # Main application entry point
│   ├── audioProcessor.js # Whisper API integration
│   ├── contentAnalyzer.js # GPT-4 analysis
│   ├── fileManager.js    # File operations
│   ├── config.js         # Configuration management
│   └── utils.js          # Utility functions
├── package.json          # Dependencies and scripts
├── .env.example          # Environment template
├── README.md            # This file
└── CAR0004.mp3          # Sample audio file
```

### Extending the Application

You can extend the application by:

1. **Adding new analysis types** in `contentAnalyzer.js`
2. **Supporting additional file formats** in `audioProcessor.js`
3. **Adding new output formats** in `fileManager.js`
4. **Implementing batch processing** for multiple files

### Dependencies

- `openai`: OpenAI API client for Whisper and GPT
- `dotenv`: Environment variable management
- `form-data`: Multipart form data for file uploads
- `node-fetch`: HTTP client for API requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your OpenAI API key and account status
3. Ensure your audio file meets the requirements
4. Check Node.js version compatibility

For additional help, please check your:
- OpenAI API account status and credits
- File permissions and paths
- Network connectivity for API calls

---

**Happy transcribing! 🎵→📝** 