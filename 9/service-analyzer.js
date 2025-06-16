#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

class ServiceAnalyzer {
  constructor() {
    this.openai = null;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error(chalk.red('❌ Error: OpenAI API key not found!'));
      console.log(chalk.yellow('Please set your OpenAI API key as an environment variable: OPENAI_API_KEY=your_key_here'));
      process.exit(1);
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  generatePrompt(input, isServiceName = true) {
    const basePrompt = `Analyze the following ${isServiceName ? 'digital service' : 'service description'} and generate a comprehensive markdown report with the following sections:

## Brief History
Provide founding year, key milestones, and important developments.

## Target Audience
Describe the primary user segments and demographics.

## Core Features
List the top 2-4 key functionalities that define the service.

## Unique Selling Points
Identify the key differentiators that set this service apart from competitors.

## Business Model
Explain how the service generates revenue and monetizes its offerings.

## Tech Stack Insights
Provide any available information about technologies, platforms, or technical approaches used.

## Perceived Strengths
Highlight the most praised aspects, standout features, and competitive advantages.

## Perceived Weaknesses
Identify commonly cited drawbacks, limitations, or areas for improvement.

${isServiceName ? `Service: ${input}` : `Service Description: ${input}`}

Please provide factual, well-researched information in clean markdown format. Be concise but comprehensive, maintaining a neutral and professional tone. If specific information is not readily available, indicate this clearly rather than speculating.`;

    return basePrompt;
  }

  async analyzeService(input, isServiceName = true) {
    try {
      console.log(chalk.blue('🔍 Analyzing service...'));
      console.log(chalk.gray('This may take a few moments...'));

      const prompt = this.generatePrompt(input, isServiceName);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional digital service analyst with expertise in technology companies, SaaS platforms, and digital products. Provide accurate, well-structured analysis based on publicly available information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }

  formatMarkdownReport(content, serviceName) {
    const timestamp = new Date().toISOString().split('T')[0];
    const header = `# Digital Service Analysis Report

**Service:** ${serviceName}  
**Generated:** ${timestamp}  
**Analyzer:** Digital Service Analyzer v1.0

---

`;
    return header + content;
  }

  async saveToFile(content, serviceName) {
    try {
      const filename = `${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-analysis.md`;
      const filepath = path.join(process.cwd(), filename);
      
      await fs.writeFile(filepath, content, 'utf8');
      console.log(chalk.green(`✅ Report saved to: ${filename}`));
      return filename;
    } catch (error) {
      console.error(chalk.red(`❌ Error saving file: ${error.message}`));
      throw error;
    }
  }

  displayReport(content) {
    console.log(chalk.cyan('\n' + '='.repeat(80)));
    console.log(chalk.cyan.bold('SERVICE ANALYSIS REPORT'));
    console.log(chalk.cyan('='.repeat(80)));
    console.log(content);
    console.log(chalk.cyan('='.repeat(80) + '\n'));
  }

  async runInteractiveMode() {
    console.log(chalk.blue.bold('🚀 Digital Service Analyzer - Interactive Mode\n'));

    const questions = [
      {
        type: 'list',
        name: 'inputType',
        message: 'How would you like to provide the service information?',
        choices: [
          { name: 'Service Name (e.g., Spotify, Notion)', value: 'serviceName' },
          { name: 'Service Description (raw text)', value: 'description' }
        ]
      },
      {
        type: 'input',
        name: 'serviceInput',
        message: 'Enter the service name:',
        when: (answers) => answers.inputType === 'serviceName',
        validate: (input) => input.trim() ? true : 'Please enter a service name'
      },
      {
        type: 'input',
        name: 'serviceInput',
        message: 'Enter the service description (you can paste multi-line text):',
        when: (answers) => answers.inputType === 'description',
        validate: (input) => input.trim() ? true : 'Please enter a service description'
      },
      {
        type: 'confirm',
        name: 'saveToFile',
        message: 'Would you like to save the report to a markdown file?',
        default: true
      }
    ];

    try {
      const answers = await inquirer.prompt(questions);
      const isServiceName = answers.inputType === 'serviceName';
      const serviceName = isServiceName ? answers.serviceInput : 'Custom Service';

      const analysis = await this.analyzeService(answers.serviceInput, isServiceName);
      const formattedReport = this.formatMarkdownReport(analysis, serviceName);

      this.displayReport(formattedReport);

      if (answers.saveToFile) {
        await this.saveToFile(formattedReport, serviceName);
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  }
}

// CLI Setup
const program = new Command();

program
  .name('service-analyzer')
  .description('Analyze digital services and generate comprehensive markdown reports')
  .version('1.0.0');

program
  .command('analyze')
  .alias('a')
  .description('Analyze a digital service')
  .option('-s, --service <name>', 'Service name to analyze')
  .option('-d, --description <text>', 'Service description to analyze')
  .option('-o, --output <filename>', 'Output filename (optional)')
  .option('--no-save', 'Do not save to file')
  .action(async (options) => {
    const analyzer = new ServiceAnalyzer();

    if (!options.service && !options.description) {
      console.error(chalk.red('❌ Error: Please provide either --service or --description'));
      program.help();
      return;
    }

    if (options.service && options.description) {
      console.error(chalk.red('❌ Error: Please provide either --service OR --description, not both'));
      program.help();
      return;
    }

    try {
      const input = options.service || options.description;
      const isServiceName = !!options.service;
      const serviceName = options.service || 'Custom Service';

      const analysis = await analyzer.analyzeService(input, isServiceName);
      const formattedReport = analyzer.formatMarkdownReport(analysis, serviceName);

      analyzer.displayReport(formattedReport);

      if (options.save !== false) {
        const filename = options.output || `${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-analysis.md`;
        await fs.writeFile(filename, formattedReport, 'utf8');
        console.log(chalk.green(`✅ Report saved to: ${filename}`));
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('interactive')
  .alias('i')
  .description('Run in interactive mode')
  .action(async () => {
    const analyzer = new ServiceAnalyzer();
    await analyzer.runInteractiveMode();
  });

// Default to interactive mode if no command specified
if (process.argv.length <= 2) {
  const analyzer = new ServiceAnalyzer();
  analyzer.runInteractiveMode();
} else {
  program.parse();
} 