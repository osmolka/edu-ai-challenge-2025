const { OpenAI } = require('openai');
const { ProgressSpinner, countWords } = require('./utils');

class ContentAnalyzer {
  constructor(apiKey, model = 'gpt-4.1-mini') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Generate a summary of the transcript using GPT
   * @param {string} transcript 
   * @returns {Promise<string>}
   */
  async generateSummary(transcript) {
    const spinner = new ProgressSpinner('📝 Generating summary...');
    
    try {
      spinner.start();

      const prompt = `Please provide a concise, well-structured summary of the following transcript. 
Focus on the main points, key insights, and important details. Use clear headings and bullet points where appropriate.

Transcript:
${transcript}`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing and summarizing spoken content. Create clear, actionable summaries that capture the essence and key points of conversations, meetings, or presentations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      spinner.stop('📝 Summary generated');
      return response.choices[0].message.content.trim();

    } catch (error) {
      spinner.fail('📝 Summary generation failed');
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze transcript for frequently mentioned topics
   * @param {string} transcript 
   * @returns {Promise<Array<{topic: string, mentions: number}>>}
   */
  async analyzeTopics(transcript) {
    const spinner = new ProgressSpinner('🔍 Analyzing topics...');
    
    try {
      spinner.start();

      // Check if transcript is too short for meaningful analysis
      if (!transcript || transcript.trim().length < 50) {
        console.warn('Transcript too short for topic analysis, using fallback');
        spinner.stop('🔍 Topic analysis completed (fallback)');
        return await this.fallbackTopicAnalysis(transcript);
      }

      const prompt = `Analyze the following transcript and identify the most frequently mentioned topics, themes, or subjects. 
Return a JSON object with a "topics" array containing the top topics and their mention counts. Each topic should be a clear, concise phrase (2-4 words max).
Focus on substantive topics, not common words or filler phrases.

Return ONLY a JSON object in this exact format:
{
  "topics": [
    {"topic": "Topic Name", "mentions": number},
    {"topic": "Another Topic", "mentions": number}
  ]
}

Transcript:
${transcript}`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at content analysis and topic extraction. Identify meaningful topics and themes from transcripts, focusing on business concepts, project names, processes, and key subjects discussed. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      let topics = [];
      try {
        const responseText = response.choices[0].message.content.trim();
        console.log('🔍 Raw GPT response:', responseText.substring(0, 200) + '...');
        
        // Parse the JSON response
        let parsed = JSON.parse(responseText);
        
        // Extract topics from various possible response formats
        if (parsed.topics && Array.isArray(parsed.topics)) {
          topics = parsed.topics;
        } else if (parsed.frequently_mentioned_topics && Array.isArray(parsed.frequently_mentioned_topics)) {
          topics = parsed.frequently_mentioned_topics;
        } else if (Array.isArray(parsed)) {
          topics = parsed;
        } else if (parsed.result && Array.isArray(parsed.result)) {
          topics = parsed.result;
        } else {
          console.warn('Unexpected response format from GPT, using fallback');
          topics = await this.fallbackTopicAnalysis(transcript);
        }
        
        // Validate and clean the topics
        topics = topics
          .filter(item => item && item.topic && typeof item.mentions === 'number' && item.mentions > 0)
          .sort((a, b) => b.mentions - a.mentions)
          .slice(0, 10); // Keep top 10 topics
          
        // If no valid topics found, use fallback
        if (topics.length === 0) {
          console.warn('No valid topics found in GPT response, using fallback');
          topics = await this.fallbackTopicAnalysis(transcript);
        }
          
      } catch (parseError) {
        console.warn('Failed to parse topics JSON:', parseError.message);
        console.warn('Using fallback analysis');
        topics = await this.fallbackTopicAnalysis(transcript);
      }

      spinner.stop('🔍 Topic analysis completed');
      return topics;

    } catch (error) {
      spinner.fail('🔍 Topic analysis failed');
      console.error('Topic analysis error:', error.message);
      
      // Use fallback analysis if GPT fails
      try {
        console.log('🔍 Using fallback topic analysis...');
        return await this.fallbackTopicAnalysis(transcript);
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError.message);
        return [];
      }
    }
  }

  /**
   * Fallback topic analysis using simple word frequency
   * @param {string} transcript 
   * @returns {Array<{topic: string, mentions: number}>}
   */
  async fallbackTopicAnalysis(transcript) {
    if (!transcript || transcript.trim().length === 0) {
      return [];
    }

    // Simple word frequency analysis as fallback
    const words = transcript.toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    if (words.length === 0) {
      return [];
    }

    const stopWords = new Set([
      'that', 'this', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 
      'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 
      'more', 'very', 'what', 'know', 'just', 'into', 'over', 'think', 'also', 'your', 
      'work', 'life', 'only', 'new', 'years', 'way', 'may', 'say', 'each', 'use', 'her', 
      'all', 'how', 'its', 'our', 'out', 'day', 'get', 'use', 'man', 'new', 'now', 'old', 
      'see', 'him', 'two', 'way', 'who', 'boy', 'did', 'number', 'part', 'find', 'right', 
      'long', 'place', 'year', 'came', 'show', 'every', 'good', 'give', 'name', 'very', 
      'through', 'just', 'form', 'sentence', 'great', 'where', 'help', 'much', 'too', 
      'line', 'right', 'move', 'try', 'kind', 'hand', 'picture', 'again', 'change', 
      'off', 'play', 'spell', 'air', 'away', 'animal', 'house', 'point', 'page', 
      'letter', 'mother', 'answer', 'found', 'study', 'still', 'learn', 'should', 
      'america', 'world', 'when', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 
      'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 
      'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 
      'may', 'part', 'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 
      'place', 'year', 'live', 'me', 'back', 'give', 'most', 'very', 'after', 'thing', 
      'our', 'just', 'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where', 
      'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean', 'old', 'any', 
      'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form', 
      'three', 'small', 'set', 'put', 'end', 'does', 'another', 'well', 'large', 'must', 
      'big', 'even', 'such', 'because', 'turn', 'here', 'why', 'ask', 'went', 'men', 
      'read', 'need', 'land', 'different', 'home', 'us', 'move', 'try', 'kind', 'hand', 
      'picture', 'again', 'change', 'off', 'play', 'spell', 'air', 'away', 'animal', 
      'house', 'point', 'page', 'letter', 'mother', 'answer', 'found', 'study', 'still', 
      'learn', 'should', 'america', 'world'
    ]);

    const wordCount = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const results = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, mentions]) => ({ 
        topic: topic.charAt(0).toUpperCase() + topic.slice(1), 
        mentions 
      }));

    // If no meaningful words found, return at least one generic topic
    if (results.length === 0) {
      return [{ topic: "General Discussion", mentions: 1 }];
    }

    return results;
  }

  /**
   * Generate complete analytics for the transcript
   * @param {string} transcript 
   * @param {number} durationSeconds 
   * @returns {Promise<Object>}
   */
  async generateAnalytics(transcript, durationSeconds = 0) {
    const wordCount = countWords(transcript);
    
    // Calculate WPM only if we have duration
    let speakingSpeedWPM = 0;
    if (durationSeconds > 0) {
      const minutes = durationSeconds / 60;
      speakingSpeedWPM = Math.round((wordCount / minutes) * 10) / 10;
    }

    const topics = await this.analyzeTopics(transcript);

    return {
      word_count: wordCount,
      speaking_speed_wpm: speakingSpeedWPM,
      frequently_mentioned_topics: topics
    };
  }
}

module.exports = ContentAnalyzer; 