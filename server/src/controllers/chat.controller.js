const openaiService = require('../services/ai/openai.service');
const Task = require('../models/task.model');
const { logger } = require('../utils/logger');

/**
 * Process chat message
 */
exports.processChat = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        message: 'Invalid request: messages array is required'
      });
    }
    
    // Get user's tasks for context
    const userTasks = await Task.find({ user: req.user.id });
    
    // Prepare system context with user tasks
    const systemContext = `
      The user has ${userTasks.length} configured news analysis tasks:
      ${userTasks.map(task => `- ${task.name}: Keywords: ${task.keywords.join(', ')}, Categories: ${task.categories.join(', ')}`).join('\n')}
      
      You can help them configure new tasks, modify existing ones, or understand their analysis results.
      When the user wants to create or modify a task, extract the relevant parameters (keywords, categories, sources, schedule).
      Task parameters:
      - keywords: Array of keywords to search for
      - categories: One or more of [business, entertainment, general, health, science, sports, technology]
      - sources: Optional array of news sources
      - schedule: Frequency (hourly, daily, weekly), timeOfDay (HH:MM format), dayOfWeek (0-6, starting from Sunday)
    `;
    
    // Add system message if not present
    const chatMessages = messages.some(msg => msg.role === 'system')
      ? messages
      : [{ role: 'system', content: systemContext }, ...messages];
    
    // Process chat with OpenAI
    const response = await openaiService.processChat(chatMessages);
    
    res.status(200).json({
      response
    });
  } catch (error) {
    logger.error('Process chat error:', error);
    res.status(500).json({
      message: 'Error processing chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};