import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, QuestionMark } from '@mui/icons-material';

function SentimentIndicator({ sentiment }) {
  const sentimentConfig = {
    positive: {
      icon: <TrendingUp fontSize="large" />,
      color: '#4caf50',
      text: 'Positive'
    },
    negative: {
      icon: <TrendingDown fontSize="large" />,
      color: '#f44336',
      text: 'Negative'
    },
    neutral: {
      icon: <TrendingFlat fontSize="large" />,
      color: '#2196f3',
      text: 'Neutral'
    },
    mixed: {
      icon: <QuestionMark fontSize="large" />,
      color: '#ff9800',
      text: 'Mixed'
    }
  };

  const config = sentimentConfig[sentiment] || sentimentConfig.neutral;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: `${config.color}15`,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          border: `2px solid ${config.color}`
        }}
      >
        {config.icon}
      </Box>
      <Typography variant="h6" fontWeight="medium" sx={{ color: config.color }}>
        {config.text}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
        {sentiment === 'positive' && 'Articles convey primarily positive sentiment about the topics.'}
        {sentiment === 'negative' && 'Articles convey primarily negative sentiment about the topics.'}
        {sentiment === 'neutral' && 'Articles present topics in a mostly factual, neutral manner.'}
        {sentiment === 'mixed' && 'Articles show a mix of positive and negative sentiments on the topics.'}
      </Typography>
    </Box>
  );
}

export default SentimentIndicator;