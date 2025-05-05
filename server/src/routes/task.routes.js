const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Task routes - all protected
router.use(protect);

router.route('/')
  .get(taskController.getTasks)
  .post(taskController.createTask);

router.route('/:id')
  .get(taskController.getTask)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

router.post('/:id/run', taskController.runTask);

module.exports = router;