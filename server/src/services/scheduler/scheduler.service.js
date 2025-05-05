const cron = require('node-cron');
const Task = require('../../models/task.model');
const NewsResult = require('../../models/newsResult.model');
const newsService = require('../news/news.service');
const openaiService = require('../ai/openai.service');
const { logger } = require('../../utils/logger');

// Scheduler instance
let schedulerInstance = null;

/**
 * Execute a specific task
 * @param {Object} task - Task document from database
 */
async function executeTask(task) {
  try {
    logger.info(`Executing task: ${task.name} (${task._id})`);
    
    // Fetch news based on task configuration
    const newsResponse = await newsService.fetchNewsByKeywords(
      task.keywords,
      task.categories,
      task.sources,
      new Date(task.lastRun || Date.now() - 24 * 60 * 60 * 1000) // From last run or 24h ago
    );
    
    if (!newsResponse.articles || newsResponse.articles.length === 0) {
      logger.info(`No articles found for task: ${task._id}`);
      
      // Update task last run time
      await Task.findByIdAndUpdate(task._id, {
        lastRun: new Date(),
        $inc: { runCount: 1 }
      });
      
      return;
    }
    
    // Process articles with AI
    const aiAnalysis = await openaiService.analyzeNews(newsResponse.articles);
    
    // Save results to database
    const newsResult = new NewsResult({
      task: task._id,
      articles: newsResponse.articles,
      aiAnalysis
    });
    
    await newsResult.save();
    
    // Update task with last run time
    await Task.findByIdAndUpdate(task._id, {
      lastRun: new Date()
    });
    
    logger.info(`Task ${task._id} completed successfully`);
  } catch (error) {
    logger.error(`Error executing task ${task._id}:`, error);
  }
}

/**
 * Check for and execute due tasks
 */
async function checkAndExecuteTasks() {
  try {
    const now = new Date();
    
    // Find tasks that are due to run
    const dueTasks = await Task.find({
      active: true,
      nextRun: { $lte: now }
    });
    
    logger.info(`Found ${dueTasks.length} tasks due for execution`);
    
    // Execute each task
    for (const task of dueTasks) {
      await executeTask(task);
      
      // Update next run time
      task.markModified('schedule'); // Ensure pre-save hook runs
      await task.save();
    }
  } catch (error) {
    logger.error('Error in scheduler:', error);
  }
}

/**
 * Setup the task scheduler
 */
function setupScheduler() {
  // Avoid duplicate schedulers
  if (schedulerInstance) {
    schedulerInstance.stop();
  }
  
  // Run every 5 minutes
  schedulerInstance = cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduler check');
    await checkAndExecuteTasks();
  });
  
  logger.info('Task scheduler initialized');
  
  return schedulerInstance;
}

/**
 * Run a specific task immediately
 * @param {String} taskId - ID of the task to run
 */
async function runTaskNow(taskId) {
  try {
    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    await executeTask(task);
    return true;
  } catch (error) {
    logger.error(`Error running task ${taskId} now:`, error);
    throw error;
  }
}

module.exports = {
  setupScheduler,
  runTaskNow,
  executeTask // Exported for testing
};