const NewsResult = require('../models/newsResult.model');
const Task = require('../models/task.model');
const newsService = require('../services/news/news.service');
const { logger } = require('../utils/logger');

/**
 * Get latest results for a specific task
 */
exports.getTaskResults = async (req, res) => {
  try {
    // Verify task belongs to user
    const task = await Task.findOne({
      _id: req.params.taskId,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    
    // Get latest results for task
    const results = await NewsResult.find({ task: req.params.taskId })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 10)
      .skip(parseInt(req.query.skip) || 0);
    
    // Get total count for pagination
    const total = await NewsResult.countDocuments({ task: req.params.taskId });
    
    res.status(200).json({
      results,
      pagination: {
        total,
        limit: parseInt(req.query.limit) || 10,
        skip: parseInt(req.query.skip) || 0
      }
    });
  } catch (error) {
    logger.error('Get task results error:', error);
    res.status(500).json({
      message: 'Error getting task results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific result
 */
exports.getResult = async (req, res) => {
  try {
    // Find result
    const result = await NewsResult.findById(req.params.resultId);
    
    if (!result) {
      return res.status(404).json({
        message: 'Result not found'
      });
    }
    
    // Verify task belongs to user
    const task = await Task.findOne({
      _id: result.task,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(403).json({
        message: 'Not authorized to access this result'
      });
    }
    
    res.status(200).json({
      result
    });
  } catch (error) {
    logger.error('Get result error:', error);
    res.status(500).json({
      message: 'Error getting result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search for news
 */
exports.searchNews = async (req, res) => {
  try {
    const { keywords, categories, sources, fromDate, page, pageSize } = req.body;
    
    // Validate
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        message: 'Keywords are required'
      });
    }
    
    // Fetch news
    const newsResponse = await newsService.fetchNewsByKeywords(
      keywords,
      categories,
      sources,
      fromDate,
      page,
      pageSize
    );
    
    res.status(200).json({
      ...newsResponse
    });
  } catch (error) {
    logger.error('Search news error:', error);
    res.status(500).json({
      message: 'Error searching news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get latest news by category
 */
exports.getLatestNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page, pageSize } = req.query;
    
    // Validate category
    const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category'
      });
    }
    
    // Fetch news
    const newsResponse = await newsService.fetchNewsByCategory(
      category,
      parseInt(page) || 1,
      parseInt(pageSize) || 10
    );
    
    res.status(200).json({
      ...newsResponse
    });
  } catch (error) {
    logger.error('Get news by category error:', error);
    res.status(500).json({
      message: 'Error getting news by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};