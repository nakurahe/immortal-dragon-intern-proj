import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Timeline,
  PlayArrow,
  Create,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import DashboardSummary from './DashboardSummary';
import TrendingTopics from './TrendingTopics';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tasks
        const tasksResponse = await api.get('/api/tasks');
        setTasks(tasksResponse.data.tasks);
        console.log('Fetched tasks:', tasksResponse.data.tasks);
        // Fetch recent results (if tasks exist)
        if (tasksResponse.data.tasks.length > 0) {
          const resultPromises = tasksResponse.data.tasks.slice(0, 3).map(task => 
            api.get(`/api/news/task/${task._id}/results?limit=1`)
          );
          
          const resultsResponses = await Promise.all(resultPromises);
          console.log('Fetched results responses:', resultsResponses);
          const allResults = resultsResponses
            .flatMap(res => res.data.results)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          console.log('Fetched recent results:', allResults);
          setRecentResults(allResults);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleRunTask = async (taskId) => {
    try {
      await api.post(`/api/tasks/${taskId}/run`);
      // Show success message or update UI
    } catch (err) {
      console.error('Error running task:', err);
      // Show error message
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      <DashboardSummary taskCount={tasks.length} />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Tasks
              </Typography>
              <Button size="small" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {tasks.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No tasks found. Create your first task to start analyzing news.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/tasks/create')}
                >
                  Create Task
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {tasks.slice(0, 3).map((task) => (
                  <Grid item xs={12} key={task._id}>
                    <Card variant="outlined">
                      <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h6">{task.name}</Typography>
                        <Box sx={{ mt: 1, mb: 1 }}>
                          {task.keywords.slice(0, 3).map((keyword) => (
                            <Chip 
                              key={keyword} 
                              label={keyword} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                          {task.keywords.length > 3 && (
                            <Chip 
                              label={`+${task.keywords.length - 3} more`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Next run: {task.nextRun ? format(new Date(task.nextRun), 'PPp') : 'Not scheduled'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<PlayArrow />}
                          onClick={() => handleRunTask(task._id)}
                        >
                          Run Now
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Create />}
                          onClick={() => navigate(`/tasks/${task._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                          Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
        
        {/* Trending Topics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Trending Topics
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <TrendingTopics results={recentResults} />
          </Paper>
        </Grid>
        
        {/* Recent Results */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Analysis Results
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentResults.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No results yet. Run a task to get news analysis.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {recentResults.map((result) => (
                  <Grid item xs={12} sm={6} md={4} key={result._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {result.task?.name || 'Analysis Result'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {format(new Date(result.createdAt), 'PPp')}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {result.aiAnalysis?.summary?.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={`${result.articles?.length || 0} articles`} 
                            size="small" 
                            sx={{ mr: 1 }} 
                          />
                          {result.aiAnalysis?.sentiment && (
                            <Chip 
                              label={result.aiAnalysis.sentiment} 
                              size="small"
                              color={
                                result.aiAnalysis.sentiment === 'positive' ? 'success' :
                                result.aiAnalysis.sentiment === 'negative' ? 'error' :
                                result.aiAnalysis.sentiment === 'mixed' ? 'warning' : 'default'
                              }
                            />
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small"
                          onClick={() => navigate(`/results/${result._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;