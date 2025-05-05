const Task = require('../models/task.model');
const { logger } = require('../utils/logger');
const { runTaskNow } = require('../services/scheduler/scheduler.service');

/**
 * Create a new task
 */
exports.createTask = async (req, res) => {
  try {
    const { name, description, keywords, categories, sources, schedule } = req.body;
    
    // Create task
    const task = new Task({
      user: req.user.id,
      name,
      description,
      keywords,
      categories,
      sources,
      schedule
    });
    
    // Save task
    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({
      message: 'Error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all tasks for a user
 */
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    
    res.status(200).json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Error getting tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single task
 */
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      task
    });
  } catch (error) {
    logger.error('Get task error:', error);
    res.status(500).json({
      message: 'Error getting task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a task
 */
exports.updateTask = async (req, res) => {
  try {
    const { name, description, keywords, categories, sources, schedule, active } = req.body;
    
    // Find and update task
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        name,
        description,
        keywords,
        categories,
        sources,
        schedule,
        active,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    logger.error('Update task error:', error);
    res.status(500).json({
      message: 'Error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a task
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Delete task error:', error);
    res.status(500).json({
      message: 'Error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Run a task immediately
 */
exports.runTask = async (req, res) => {
  try {
    // Verify task belongs to user
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    
    // Run task
    await runTaskNow(req.params.id);
    
    res.status(200).json({
      message: 'Task execution started'
    });
  } catch (error) {
    logger.error('Run task error:', error);
    res.status(500).json({
      message: 'Error running task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};