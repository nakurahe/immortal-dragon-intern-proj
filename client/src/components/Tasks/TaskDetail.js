import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import DeleteTaskDialog from './DeleteTaskDialog';
import TaskStatusChip from './TaskStatusChip';

function TaskDetail() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningTask, setRunningTask] = useState(false);
  const [recentResults, setRecentResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/tasks/${id}`);
        setTask(response.data.task);
        
        // Fetch recent results for this task
        setLoadingResults(true);
        const resultsResponse = await api.get(`/api/news/task/${id}/results?limit=5`);
        setRecentResults(resultsResponse.data.results);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError(err.response?.data?.message || 'Failed to load task details');
      } finally {
        setLoading(false);
        setLoadingResults(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  // Handle run task
  const handleRunTask = async () => {
    try {
      setRunningTask(true);
      await api.post(`/api/tasks/${id}/run`);
      // Show success message
    } catch (err) {
      console.error('Error running task:', err);
      // Show error message
    } finally {
      setRunningTask(false);
    }
  };

  // Handle delete dialog
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/tasks/${id}`);
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
      // Show error message
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!task) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Task not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{task.name}</Typography>
        <Box>
          <Tooltip title="Run Now">
            <Button
              variant="contained"
              color="primary"
              startIcon={runningTask ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleRunTask}
              disabled={runningTask || !task.active}
              sx={{ mr: 1 }}
            >
              {runningTask ? 'Running...' : 'Run Now'}
            </Button>
          </Tooltip>
          <Tooltip title="Edit Task">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/tasks/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete Task">
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={openDeleteDialog}
            >
              Delete
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Task Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Task Details</Typography>
              <TaskStatusChip active={task.active} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {task.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
                <Typography variant="body1">{task.description}</Typography>
              </Box>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Keywords</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {task.keywords.map((keyword) => (
                    <Chip key={keyword} label={keyword} />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">Categories</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {task.categories.map((category) => (
                    <Chip 
                      key={category} 
                      label={category.charAt(0).toUpperCase() + category.slice(1)} 
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">Sources</Typography>
                {task.sources && task.sources.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {task.sources.map((source) => (
                      <Chip key={source} label={source} variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    All sources
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Schedule</Typography>
              <ScheduleIcon color="primary" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" fontWeight="bold">Frequency</Typography>
                <Typography variant="body1">
                  {task.schedule.frequency.charAt(0).toUpperCase() + task.schedule.frequency.slice(1)}
                </Typography>
              </Grid>
              
              {task.schedule.frequency !== 'hourly' && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" fontWeight="bold">Time of Day</Typography>
                  <Typography variant="body1">
                    {task.schedule.timeOfDay}
                  </Typography>
                </Grid>
              )}
              
              {task.schedule.frequency === 'weekly' && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" fontWeight="bold">Day of Week</Typography>
                  <Typography variant="body1">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][task.schedule.dayOfWeek]}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" fontWeight="bold">Next Run</Typography>
                <Typography variant="body1">
                  {task.nextRun ? format(new Date(task.nextRun), 'PPp') : 'Not scheduled'}
                </Typography>
              </Grid>
              
              {task.lastRun && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" fontWeight="bold">Last Run</Typography>
                  <Typography variant="body1">
                    {format(new Date(task.lastRun), 'PPp')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Results */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Results</Typography>
              <Button 
                size="small" 
                endIcon={<HistoryIcon />}
                onClick={() => navigate(`/tasks/${id}/results`)}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {loadingResults ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : recentResults.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No results yet. Run the task to analyze news.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentResults.map((result) => (
                  <Card key={result._id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {format(new Date(result.createdAt), 'PPp')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {result.articles.length} articles analyzed
                      </Typography>
                      {result.aiAnalysis?.sentiment && (
                        <Chip 
                          label={`Sentiment: ${result.aiAnalysis.sentiment}`} 
                          size="small"
                          color={
                            result.aiAnalysis.sentiment === 'positive' ? 'success' :
                            result.aiAnalysis.sentiment === 'negative' ? 'error' :
                            result.aiAnalysis.sentiment === 'mixed' ? 'warning' : 'default'
                          }
                          sx={{ mt: 1 }}
                        />
                      )}
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
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        taskName={task.name}
      />
    </Box>
  );
}

export default TaskDetail;