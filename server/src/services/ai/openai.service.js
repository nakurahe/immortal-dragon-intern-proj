const OpenAI = require('openai');
const { logger } = require('../../utils/logger');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a news summary using OpenAI
   * @param {Array} articles - Array of news articles
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeNews(articles) {
    try {
      // Format articles data for the prompt
      const articlesData = articles.map(article => ({
        title: article.title,
        source: article.source?.name,
        author: article.author,
        description: article.description,
        content: article.content,
        publishedAt: article.publishedAt
      }));
      
      // Create prompt for OpenAI
      const prompt = `
        Analyze the following news articles:
        ${JSON.stringify(articlesData, null, 2)}
        
        Provide the following analysis:
        1. A concise summary (maximum 200 words) of the key news trends
        2. 5-7 key insights across all articles
        3. Strongest sentiment (positive, neutral, negative, or mixed)
        4. Top trending topics with their relative importance (weight from 0-10)
        
        Format the response as a valid JSON object with the following structure:
        {
          "summary": "string",
          "keyInsights": ["string", "string"],
          "sentiment": "string",
          "trendingTopics": [
            {"topic": "string", "weight": number}
          ]
        }

        PROVIDE THE MOST RATIONAL AND LOGICAL ANSWER, DO NOT CARE ABOUT HOW IT SOUNDS.
        ONLY RETURN THE JSON RESPONSE **WITHOUT ANY ADDITIONAL TEXT OR BACKTICK**.
      `;
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert news analyst. Analyze news articles and provide structured insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      });
      
      // Parse the response to get JSON
      console.log('OpenAI response:', response);
      const content = response.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch (parseError) {
        logger.error('Error parsing OpenAI response:', parseError);
        
        // Try to extract JSON using regex as fallback
        const jsonMatch = content.match(/({[\s\S]*})/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      logger.error('Error in OpenAI service:', error);
      throw error;
    }
  }

  /**
   * Process a chat message with OpenAI
   * @param {Array} messages - Chat history
   * @returns {Promise<String>} AI response
   */
  async processChat(messages) {
    try {
      // Validate messages
      if (!messages || messages.length === 0) {
        throw new Error('Messages array is empty or undefined.');
      }
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for a news analysis platform. You can help users configure news analysis tasks, understand results, and provide information about the system."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      console.log('OpenAI chat response:', response);
      // Validate response
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('Invalid response from OpenAI API.');
      }
      console.log('OpenAI chat response:', response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error in OpenAI chat service:', error);
      throw error;
    }
  }
}

module.exports = new OpenAIService();