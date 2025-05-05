const axios = require('axios');
const { logger } = require('../../utils/logger');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async fetchNewsByKeywords(keywords, categories, sources, fromDate, page = 1, pageSize = a10) {
    try {
      // Prepare query parameters
      const keywordQuery = keywords.join(' OR ');
      const categoriesQuery = categories ? categories.join(',') : '';
      const sourcesQuery = sources ? sources.join(',') : '';
      
      const from = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 1 week ago
      
      // Make request to News API
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: keywordQuery,
          sources: sourcesQuery,
          from,
          language: 'en',
          sortBy: 'publishedAt',
          page,
          pageSize,
          apiKey: this.apiKey
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching news:', error);
      throw error;
    }
  }

  async fetchNewsByCategory(category, page = 1, pageSize = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          category,
          country: 'us', // Default to US
          page,
          pageSize,
          apiKey: this.apiKey
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching news by category:', error);
      throw error;
    }
  }

  async fetchLatestNews(page = 1, pageSize = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          country: 'us', // Default to US
          page,
          pageSize,
          apiKey: this.apiKey
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching latest news:', error);
      throw error;
    }
  }
}

module.exports = new NewsService();