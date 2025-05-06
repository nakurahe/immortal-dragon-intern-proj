import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Link
} from '@mui/material';
import {
  Insights,
  Newspaper,
  TrendingUp,
  ArrowBack,
  OpenInNew
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import InsightsList from './InsightsList';
import SentimentIndicator from './SentimentIndicator';
import TopicCloud from './TopicCloud';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`result-tabpanel-${index}`}
      aria-labelledby={`result-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ResultDetail() {
  const [result, setResult] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  const { resultId } = useParams();
  const navigate = useNavigate();

  // Fetch result details
  useEffect(() => {
    const fetchResultDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/results/${resultId}`);
        setResult(response.data.result);
        
        // Fetch associated task
        if (response.data.result.task) {
          const taskResponse = await api.get(`/api/tasks/${response.data.result.task}`);
          setTask(taskResponse.data.task);
        }
      } catch (err) {
        console.error('Error fetching result details:', err);
        setError('Failed to load result details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResultDetails();
  }, [resultId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  if (!result) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Result not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => task ? navigate(`/tasks/${task._id}/results`) : navigate('/tasks')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Analysis Results</Typography>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(result.createdAt), 'PPpp')}
        </Typography>
      </Box>
      
      {/* Task Info */}
      {task && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">{task.name}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {task.keywords.map((keyword) => (
              <Chip key={keyword} label={keyword} size="small" />
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="result tabs"
        >
          <Tab icon={<Insights />} label="Summary" id="result-tab-0" />
          <Tab icon={<TrendingUp />} label="Trending Topics" id="result-tab-1" />
          <Tab icon={<Newspaper />} label="Articles" id="result-tab-2" />
        </Tabs>
        
        {/* Summary Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Typography variant="body1" paragraph>
                {result.aiAnalysis?.summary || 'No summary available'}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Key Insights</Typography>
              <InsightsList insights={result.aiAnalysis?.keyInsights || []} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Sentiment Analysis</Typography>
                  <SentimentIndicator sentiment={result.aiAnalysis?.sentiment || 'neutral'} />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Analysis Stats</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      <strong>Articles Analyzed:</strong> {result.articles?.length || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Top Topics:</strong> {result.aiAnalysis?.trendingTopics?.length || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Key Insights:</strong> {result.aiAnalysis?.keyInsights?.length || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Trending Topics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Trending Topics</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Topics are weighted by relevance and frequency across analyzed articles.
            </Typography>
          </Box>
          
          {result.aiAnalysis?.trendingTopics?.length > 0 ? (
            <Box sx={{ height: 400 }}>
              <TopicCloud topics={result.aiAnalysis.trendingTopics} />
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No trending topics found in this analysis
            </Typography>
          )}
          
          {result.aiAnalysis?.trendingTopics?.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Topic</TableCell>
                    <TableCell align="right">Weight</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.aiAnalysis.trendingTopics
                    .sort((a, b) => b.weight - a.weight)
                    .map((topic) => (
                    <TableRow key={topic.topic}>
                      <TableCell>{topic.topic}</TableCell>
                      <TableCell align="right">{topic.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Articles Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Articles Analyzed</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {result.articles?.length || 0} articles were analyzed in this result
          </Typography>
          
          <Grid container spacing={3}>
            {result.articles?.length > 0 ? (
              result.articles.map((article, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {article.urlToImage && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={article.urlToImage}
                        alt={article.title}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x140?text=News'; }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '1rem' }}>
                        {article.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {article.source?.name} • {article.publishedAt ? format(new Date(article.publishedAt), 'PP') : 'Unknown date'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {article.description?.substring(0, 120)}
                        {article.description?.length > 120 ? '...' : ''}
                      </Typography>
                    </CardContent>
                    {article.url && (
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          endIcon={<OpenInNew fontSize="small" />}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read Article
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No articles found in this analysis
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default ResultDetail;