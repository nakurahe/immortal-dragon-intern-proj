import React, { useMemo } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';

function TrendingTopics({ results }) {
  // Extract and combine trending topics from all results
  const trendingTopics = useMemo(() => {
    if (!results || results.length === 0) {
      return [];
    }

    // Collect all topics from results
    const topics = results
      .flatMap(result => result.aiAnalysis?.trendingTopics || [])
      .filter(Boolean);

    // Merge duplicate topics and sum weights
    const topicMap = topics.reduce((acc, { topic, weight }) => {
      if (!acc[topic]) {
        acc[topic] = { topic, weight, count: 1 };
      } else {
        acc[topic].weight += weight;
        acc[topic].count += 1;
      }
      return acc;
    }, {});

    // Convert back to array and sort by weight
    return Object.values(topicMap)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 15); // Take top 15 topics
  }, [results]);

  // Calculate max weight for relative sizing
  const maxWeight = useMemo(() => {
    if (trendingTopics.length === 0) return 1;
    return Math.max(...trendingTopics.map(t => t.weight));
  }, [trendingTopics]);

  if (!results || results.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No analysis results available to show trending topics.
        </Typography>
      </Box>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Processing topics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {trendingTopics.map(({ topic, weight }) => {
          // Calculate size based on weight relative to max weight
          const relativeSize = 0.8 + (weight / maxWeight) * 0.7;
          const fontSize = `${relativeSize}rem`;
          const intensity = Math.min(900, Math.floor((weight / maxWeight) * 900));
          
          return (
            <Chip
              key={topic}
              label={topic}
              sx={{
                fontSize,
                fontWeight: 500,
                bgcolor: `primary.${intensity}`,
                color: intensity > 500 ? 'white' : 'inherit',
                m: 0.5
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default TrendingTopics;