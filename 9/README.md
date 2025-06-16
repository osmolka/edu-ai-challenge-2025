# Digital Service Analyzer

A powerful Node.js console application that analyzes digital services and generates comprehensive markdown reports using OpenAI's GPT-4.1-mini API.

## 🚀 Features

- **Dual Input Modes**: Accept either known service names or raw service descriptions
- **Comprehensive Analysis**: Generate detailed reports with 8 key sections
- **Interactive CLI**: User-friendly command-line interface with prompts
- **Flexible Output**: Display in console and/or save to markdown files
- **Error Handling**: Graceful handling of API errors and edge cases
- **OpenAI Integration**: Powered by GPT-4.1-mini for intelligent analysis

## 📋 Report Sections

Each generated report includes:

1. **Brief History** - Founding year, milestones, key developments
2. **Target Audience** - Primary user segments and demographics
3. **Core Features** - Top 2-4 key functionalities
4. **Unique Selling Points** - Key differentiators from competitors
5. **Business Model** - Revenue generation and monetization strategies
6. **Tech Stack Insights** - Technologies and platforms used
7. **Perceived Strengths** - Standout features and competitive advantages
8. **Perceived Weaknesses** - Common drawbacks and limitations

## 🛠 Installation

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn package manager
- OpenAI API key

### Setup

1. **Clone or download the project files**
   
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key** (choose one method):
   
   **Option A: Environment Variable**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```
   
   **Option B: Create a .env file**
   ```bash
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```
   
   **Option C: The application includes a fallback API key, but it's recommended to use your own**

4. **Make the script executable (optional):**
   ```bash
   chmod +x service-analyzer.js
   ```

## 🎯 Usage

The application supports multiple usage modes:

### 1. Interactive Mode (Recommended)

Simply run the application without arguments to enter interactive mode:

```bash
node service-analyzer.js
```

or

```bash
npm start
```

This will guide you through:
- Choosing input type (service name vs. description)
- Entering your input
- Deciding whether to save the output

### 2. Command Line Mode

#### Analyze by Service Name

```bash
node service-analyzer.js analyze --service "Spotify"
```

#### Analyze by Description

```bash
node service-analyzer.js analyze --description "A cloud-based project management tool for teams"
```

#### Save with Custom Filename

```bash
node service-analyzer.js analyze --service "Notion" --output "notion-detailed-analysis.md"
```

#### Display Only (No File Save)

```bash
node service-analyzer.js analyze --service "Discord" --no-save
```

### 3. Command Aliases

Use shorter commands for convenience:

```bash
# Short form
node service-analyzer.js a -s "GitHub"

# Interactive mode
node service-analyzer.js i
```

## 📖 Command Reference

### Main Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `analyze` | `a` | Analyze a specific service |
| `interactive` | `i` | Run in interactive mode |

### Options for `analyze` command

| Option | Description | Example |
|--------|-------------|---------|
| `-s, --service <name>` | Service name to analyze | `-s "Slack"` |
| `-d, --description <text>` | Service description to analyze | `-d "Video conferencing platform"` |
| `-o, --output <filename>` | Custom output filename | `-o "my-analysis.md"` |
| `--no-save` | Don't save to file, display only | `--no-save` |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Recommended | Fallback key included |

### API Configuration

The application uses GPT-4.1-mini with the following settings:
- **Model**: `gpt-4.1-mini`
- **Max Tokens**: 2000
- **Temperature**: 0.3 (for consistent, factual responses)

## 📁 Output Files

Generated files follow this naming convention:
- Service names: `spotify-analysis.md`, `notion-analysis.md`
- Custom descriptions: `custom-service-analysis.md`
- Custom output: Whatever you specify with `-o`

Each file includes:
- Header with service name and generation timestamp
- Complete analysis in markdown format
- Professional formatting for easy reading

## 🚨 Error Handling

The application handles various error scenarios:

- **Missing API Key**: Clear instructions to set up authentication
- **API Rate Limits**: Informative error messages
- **Network Issues**: Graceful failure with retry suggestions
- **Invalid Input**: Validation and helpful prompts
- **File System Errors**: Permission and path error handling

## 🔍 Examples

### Example 1: Popular Service Analysis
```bash
node service-analyzer.js analyze --service "Netflix"
```

### Example 2: Custom Service Description
```bash
node service-analyzer.js analyze --description "A mobile app that helps users track their daily water intake with reminders and gamification features"
```

### Example 3: Batch Analysis with Custom Names
```bash
node service-analyzer.js analyze -s "Zoom" -o "zoom-competitive-analysis.md"
node service-analyzer.js analyze -s "Teams" -o "teams-competitive-analysis.md"
```

## 🎨 Output Format

The generated reports feature:
- Clean markdown formatting
- Professional header with metadata
- Structured sections with clear headings
- Bullet points and organized content
- Neutral, factual tone
- Timestamp and version information

## 🐛 Troubleshooting

### Common Issues

1. **"OpenAI API key not found"**
   - Set the `OPENAI_API_KEY` environment variable
   - Or create a `.env` file with your key

2. **"Module not found" errors**
   - Run `npm install` to install dependencies
   - Ensure you're in the correct directory

3. **Permission denied**
   - Make sure you have write permissions in the current directory
   - Try running with `sudo` if necessary (not recommended)

4. **API errors**
   - Check your API key is valid and has credits
   - Verify internet connectivity
   - Try again after a few minutes if rate limited

### Getting Help

If you encounter issues:
1. Check the error message carefully
2. Verify all prerequisites are met
3. Try running in interactive mode for better error reporting
4. Ensure your OpenAI API key is valid and has available credits

## 📝 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

This is a standalone application, but suggestions and improvements are welcome! 