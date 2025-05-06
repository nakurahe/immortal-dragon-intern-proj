import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { Assessment, Event, Article } from '@mui/icons-material';

function DashboardSummary({ taskCount, resultCount, articleCount }) {
  const summaryItems = [
    {
      title: 'Active Tasks',
      value: taskCount || 0,
      icon: <Event fontSize="large" color="primary" />,
      description: 'Configured news analysis tasks'
    },
    {
      title: 'Analysis Results',
      value: resultCount || 0,
      icon: <Assessment fontSize="large" color="secondary" />,
      description: 'AI-generated news insights'
    },
    {
      title: 'Articles Analyzed',
      value: articleCount || 0,
      icon: <Article fontSize="large" color="success" />,
      description: 'News articles processed'
    }
  ];

  return (
    <Grid container spacing={3}>
      {summaryItems.map((item) => (
        <Grid item xs={12} sm={4} key={item.title}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -15,
                right: -15,
                bgcolor: 'action.hover',
                borderRadius: '50%',
                width: 100,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7
              }}
            >
              {item.icon}
            </Box>
            <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
              {item.value}
            </Typography>
            <Typography variant="h6" component="div">
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default DashboardSummary;