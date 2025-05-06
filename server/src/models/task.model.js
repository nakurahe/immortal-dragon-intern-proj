const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: String,
    enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
    default: ['general']
  }],
  sources: [{
    type: String,
    trim: true
  }],
  schedule: {
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    timeOfDay: {
      type: String,
      default: '09:00' // For daily and weekly schedules
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 1 // Monday for weekly schedules
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate next run time before saving
taskSchema.pre('save', function(next) {
  if (this.isModified('schedule') || !this.nextRun) {
    const now = new Date();
    
    switch (this.schedule.frequency) {
      case 'hourly':
        this.nextRun = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
        break;
      case 'daily':
        const [hours, minutes] = this.schedule.timeOfDay.split(':').map(Number);
        const nextDay = new Date(now);
        nextDay.setHours(hours, minutes, 0, 0);
        if (nextDay <= now) {
          nextDay.setDate(nextDay.getDate() + 1);
        }
        this.nextRun = nextDay;
        break;
      case 'weekly':
        const [weekHours, weekMinutes] = this.schedule.timeOfDay.split(':').map(Number);
        const nextWeek = new Date(now);
        const daysUntilNext = (this.schedule.dayOfWeek + 7 - nextWeek.getDay()) % 7;
        nextWeek.setDate(nextWeek.getDate() + daysUntilNext);
        nextWeek.setHours(weekHours, weekMinutes, 0, 0);
        if (daysUntilNext === 0 && nextWeek <= now) {
          nextWeek.setDate(nextWeek.getDate() + 7);
        }
        this.nextRun = nextWeek;
        break;
    }
  }
  next();
});

const Task = mongoose.model('task', taskSchema);

module.exports = Task;