const NewsAPI = require('newsapi');
const { logger } = require('../../utils/logger');

class NewsService {
  constructor() {
    this.newsapi = new NewsAPI(process.env.NEWS_API_KEY);
  }

  async fetchNewsByKeywords(keywords, sources, fromDate, page = 1, pageSize = 10) {
    try {
      // Prepare query parameters
      const keywordQuery = keywords.join(' OR ');
      const sourcesQuery = sources ? sources.join(',') : '';
      
      const from = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 1 week ago
      
      // Make request to News API using official client
      const response = await this.newsapi.v2.everything({
        q: keywordQuery,
        sources: sourcesQuery,
        from,
        language: 'en',
        sortBy: 'publishedAt',
        page,
        pageSize
      });
      
      // console.log('keywordQuery', keywordQuery);
      // console.log('sourcesQuery', sourcesQuery);
      // console.log('from', from);
      // console.log('page', page);
      // console.log('pageSize', pageSize);
      // console.log('Response from News API:', response);
      return response;
    } catch (error) {
      logger.error('Error fetching news:', error);
      throw error;
    }
  }

  async fetchNewsByCategory(category, page = 1, pageSize = 10) {
    try {
      const response = await this.newsapi.v2.topHeadlines({
        category,
        country: 'us', // Default to US
        language: 'en',
        page,
        pageSize
      });
      
      return response;
    } catch (error) {
      logger.error('Error fetching news by category:', error);
      throw error;
    }
  }

  async fetchLatestNews(page = 1, pageSize = 10) {
    try {
      const response = await this.newsapi.v2.topHeadlines({
        country: 'us', // Default to US
        language: 'en',
        page,
        pageSize
      });
      
      return response;
    } catch (error) {
      logger.error('Error fetching latest news:', error);
      throw error;
    }
  }
  
  async fetchSources(category = null, language = 'en', country = 'us') {
    try {
      const response = await this.newsapi.v2.sources({
        category,
        language,
        country
      });
      
      return response;
    } catch (error) {
      logger.error('Error fetching news sources:', error);
      throw error;
    }
  }
}

module.exports = new NewsService();