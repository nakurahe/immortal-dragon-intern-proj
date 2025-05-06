import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { LightbulbOutlined } from '@mui/icons-material';

function InsightsList({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          No insights available
        </Box>
      </Paper>
    );
  }

  return (
    <List>
      {insights.map((insight, index) => (
        <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LightbulbOutlined color="primary" />
          </ListItemIcon>
          <ListItemText primary={insight} />
        </ListItem>
      ))}
    </List>
  );
}

export default InsightsList;