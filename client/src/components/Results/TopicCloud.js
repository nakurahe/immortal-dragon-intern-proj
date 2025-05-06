import React, { useMemo } from 'react';
import { Box } from '@mui/material';

function TopicCloud({ topics }) {
  const processedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    
    // Find max weight for scaling
    const maxWeight = Math.max(...topics.map(t => t.weight));
    
    // Calculate positions and sizes
    return topics.map((topic, index) => {
      const relativeSize = 14 + (topic.weight / maxWeight) * 20; // Font size between 14 and 34px
      const opacity = 0.3 + (topic.weight / maxWeight) * 0.7; // Opacity between 0.3 and 1
      
      // Generate a somewhat random position (but deterministic based on index)
      const angle = (index / topics.length) * 2 * Math.PI;
      const radius = 40 + Math.sin(index * 13) * 30; // Vary the distance from center
      
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      
      return {
        ...topic,
        fontSize: relativeSize,
        opacity,
        x,
        y
      };
    });
  }, [topics]);
  
  if (!topics || topics.length === 0) {
    return <Box>No topics available</Box>;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      {processedTopics.map((topic, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            left: `${topic.x}%`,
            top: `${topic.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${topic.fontSize}px`,
            fontWeight: topic.weight > 5 ? 'bold' : 'normal',
            color: 'primary.main',
            opacity: topic.opacity,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translate(-50%, -50%) scale(1.1)',
              zIndex: 2
            }
          }}
        >
          {topic.topic}
        </Box>
      ))}
    </Box>
  );
}

export default TopicCloud;