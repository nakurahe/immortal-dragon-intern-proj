import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';

function Results() {
  const [results, setResults] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { taskId } = useParams();
  const navigate = useNavigate();

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Fetch task details
        const taskResponse = await api.get(`/api/tasks/${taskId}`);
        setTask(taskResponse.data.task);
        
        // Fetch results
        const skip = (page - 1) * limit;
        const resultsResponse = await api.get(`/api/task/${taskId}/results?limit=${limit}&skip=${skip}`);
        
        setResults(resultsResponse.data.results);
        setTotalPages(Math.ceil(resultsResponse.data.pagination.total / limit));
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [taskId, page, limit]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle results per page change
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1); // Reset to first page
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
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analysis Results</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/tasks/${taskId}`)}
        >
          Back to Task
        </Button>
      </Box>
      
      {task && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5">{task.name}</Typography>
          {task.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {task.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {task.keywords.map((keyword) => (
              <Chip key={keyword} label={keyword} size="small" />
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Results list */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {results.length === 0 ? 'No results found' : 'Result History'}
        </Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="results-per-page-label">Per Page</InputLabel>
          <Select
            labelId="results-per-page-label"
            value={limit}
            label="Per Page"
            onChange={handleLimitChange}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No analysis results found for this task yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/tasks/${taskId}`)}
            sx={{ mt: 2 }}
          >
            Go to Task
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {results.map((result) => (
              <Grid item xs={12} sm={6} md={4} key={result._id}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {format(new Date(result.createdAt), 'PPpp')}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {result.articles.length} Articles Analyzed
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
                      
                      {result.aiAnalysis?.trendingTopics && result.aiAnalysis.trendingTopics.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Top Topics:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {result.aiAnalysis.trendingTopics.slice(0, 3).map((topic) => (
                              <Chip 
                                key={topic.topic} 
                                label={topic.topic} 
                                size="small" 
                                variant="outlined" 
                              />
                            ))}
                            {result.aiAnalysis.trendingTopics.length > 3 && (
                              <Chip 
                                label={`+${result.aiAnalysis.trendingTopics.length - 3} more`} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/results/${result._id}`)}
                    >
                      View Full Analysis
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default Results;