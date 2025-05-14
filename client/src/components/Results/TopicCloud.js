import { useMemo } from 'react';
import { Box } from '@mui/material';

function TopicCloud({ topics }) {
  const processedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    
    // Find max weight for scaling
    const maxWeight = Math.max(...topics.map(t => t.weight));
    
    // Calculate positions and sizes using a more condensed spiral layout
    let lastX = 0;
    let lastY = 0;
    const angleStep = 0.35; // Controls compactness of spiral
    
    return topics.map((topic, index) => {
      const relativeSize = 12 + (topic.weight / maxWeight) * 16; // Reduced font size range (12-28px)
      const opacity = 0.4 + (topic.weight / maxWeight) * 0.6; // Opacity between 0.4 and 1
      
      // Generate position using spiral layout for more efficient space usage
      const angle = index * angleStep;
      // Reduce radius range and make it grow more slowly
      const radius = 15 + Math.sqrt(index) * 5;
      
      // Calculate new position
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      
      // Prevent overlaps by checking distance to last point
      // Simple collision avoidance (improved versions would check all points)
      const minDistance = 10;
      const distToLast = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
      
      // Adjust position if too close to last point
      let finalX = x;
      let finalY = y;
      if (index > 0 && distToLast < minDistance) {
        finalX = lastX + (minDistance * (x - lastX) / distToLast);
        finalY = lastY + (minDistance * (y - lastY) / distToLast);
      }
      
      lastX = finalX;
      lastY = finalY;
      
      return {
        ...topic,
        fontSize: relativeSize,
        opacity,
        x: finalX,
        y: finalY
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
        overflow: 'hidden',
        padding: '8px' // Add padding to prevent clipping at edges
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
            padding: '2px', // Add minimal padding
            '&:hover': {
              transform: 'translate(-50%, -50%) scale(1.1)',
              zIndex: 10 // Higher z-index when hovering
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