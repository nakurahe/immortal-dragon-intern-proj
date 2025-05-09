import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Divider, 
  Card,
  CardContent
} from '@mui/material';
import { Send } from '@mui/icons-material';
import api from '../../services/api';
import MessageBubble from './MessageBubble';

function Chat() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        role: 'assistant',
        content: 'Hello! I can help you configure and manage your news analysis tasks. What would you like to do today?'
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatMessages', JSON.stringify(messages)); // Save messages to localStorage
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: input
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare messages for API (excluding system messages)
      const messageHistory = messages
        .filter(msg => msg.role !== 'system')
        .concat(userMessage);
      
      // Send to API
      const response = await api.post('/api/chat/message', {
        messages: messageHistory
      });
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response
        }
      ]);
    } catch (error) {
      console.error('Error processing chat message:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(110vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        AI Assistant
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          mb: 2,
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        {/* Chat Messages */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {messages.map((message, index) => (
            <MessageBubble 
              key={index}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                AI is thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider />
        
        {/* Input Area */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your message..."
            variant="outlined"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            sx={{ mr: 2 }}
          />
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={isLoading || !input.trim()}
            sx={{ 
              width: 48, 
              height: 48,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Helper cards */}
      <Typography variant="h6" gutterBottom>
        Suggested Actions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <SuggestionCard
          title="Create a Task"
          description="Set up a new news analysis task"
          prompt="I want to create a new task to track technology news about AI advancements."
          setInput={setInput}
        />
        <SuggestionCard
          title="Modify Settings"
          description="Change task parameters"
          prompt="Can you help me modify my existing tech news task to include healthcare AI topics?"
          setInput={setInput}
        />
        <SuggestionCard
          title="Get Insights"
          description="Understand your analysis results"
          prompt="What are the main trends in my latest news analysis results?"
          setInput={setInput}
        />
      </Box>
    </Box>
  );
}

// Helper component for suggestion cards
function SuggestionCard({ title, description, prompt, setInput }) {
  return (
    <Card 
      sx={{ 
        maxWidth: 220,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
      onClick={() => setInput(prompt)}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>
        <Typography variant="caption" color="primary">
          Click to use this prompt
        </Typography>
      </CardContent>
    </Card>
  );
}

export default Chat;