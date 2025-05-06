import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message, isUser }) {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
          ml: isUser ? 1 : 0,
          mr: isUser ? 0 : 1,
        }}
      >
        {isUser ? <Person /> : <SmartToy />}
      </Avatar>
      
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          borderRadius: 2,
          bgcolor: isUser ? 'primary.light' : 'background.default',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderTopLeftRadius: !isUser ? 0 : 2,
          borderTopRightRadius: isUser ? 0 : 2,
        }}
      >
        <Typography variant="body1" component="div">
          {/* Use ReactMarkdown to render markdown in AI messages */}
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          )}
        </Typography>
      </Paper>
    </Box>
  );
}

export default MessageBubble;