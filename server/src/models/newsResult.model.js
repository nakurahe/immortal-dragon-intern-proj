const mongoose = require('mongoose');

const newsResultSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  articles: [{
    title: {
      type: String,
      required: true
    },
    source: {
      id: String,
      name: String
    },
    author: String,
    url: String,
    urlToImage: String,
    publishedAt: Date,
    content: String,
    description: String
  }],
  aiAnalysis: {
    summary: String,
    keyInsights: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed']
    },
    trendingTopics: [{
      topic: String,
      weight: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NewsResult = mongoose.model('NewsResult', newsResultSchema);

module.exports = NewsResult;