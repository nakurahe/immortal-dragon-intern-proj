import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Stack,
  Grid,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { parse, format } from 'date-fns';
import api from '../../services/api';

// Available news categories
const NEWS_CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology'
];

function EditTask() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: [],
    categories: ['general'],
    sources: [],
    schedule: {
      frequency: 'daily',
      timeOfDay: '09:00',
      dayOfWeek: 1 // Monday
    },
    active: true
  });
  
  const [errors, setErrors] = useState({});
  const [newKeyword, setNewKeyword] = useState('');
  const [newSource, setNewSource] = useState('');
  const [timeValue, setTimeValue] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadError, setLoadError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/tasks/${id}`);
        const task = response.data.task;
        
        setFormData({
          name: task.name,
          description: task.description || '',
          keywords: task.keywords || [],
          categories: task.categories || ['general'],
          sources: task.sources || [],
          schedule: {
            frequency: task.schedule.frequency,
            timeOfDay: task.schedule.timeOfDay,
            dayOfWeek: task.schedule.dayOfWeek
          },
          active: task.active
        });
        
        // Set time value for time picker
        if (task.schedule.timeOfDay) {
          const [hours, minutes] = task.schedule.timeOfDay.split(':').map(Number);
          const timeDate = new Date();
          timeDate.setHours(hours, minutes, 0, 0);
          setTimeValue(timeDate);
        }
      } catch (err) {
        console.error('Error fetching task:', err);
        setLoadError('Failed to load task data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);

  // Handle time change
  const handleTimeChange = (newTime) => {
    setTimeValue(newTime);
    
    if (newTime) {
      const formattedTime = format(newTime, 'HH:mm');
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          timeOfDay: formattedTime
        }
      }));
    }
  };

  // Handle text field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle schedule changes
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));
  };

  // Handle categories changes
  const handleCategoriesChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      categories: typeof value === 'string' ? value.split(',') : value
    }));
  };

  // Handle active toggle
  const handleActiveToggle = (event) => {
    setFormData(prev => ({
      ...prev,
      active: event.target.checked
    }));
  };

  // Add keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, newKeyword.trim()]
    }));
    setNewKeyword('');
  };

  // Remove keyword
  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // Add source
  const handleAddSource = () => {
    if (!newSource.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, newSource.trim()]
    }));
    setNewSource('');
  };

  // Remove source
  const handleRemoveSource = (source) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s !== source)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (formData.keywords.length === 0) {
      newErrors.keywords = 'At least one keyword is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await api.put(`/api/tasks/${id}`, formData);
      navigate(`/tasks/${id}`);
    } catch (err) {
      console.error('Error updating task:', err);
      setSubmitError(err.response?.data?.message || 'Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {loadError}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Edit Task</Typography>
      </Box>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Task Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleActiveToggle}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Search Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Keywords
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label="Add Keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                  >
                    Add
                  </Button>
                </Box>
                {errors.keywords && (
                  <FormHelperText error>{errors.keywords}</FormHelperText>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {formData.keywords.map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      onDelete={() => handleRemoveKeyword(keyword)}
                    />
                  ))}
                  {formData.keywords.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No keywords added yet. Keywords are used to search for news articles.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="categories-label">Categories</InputLabel>
                <Select
                  labelId="categories-label"
                  multiple
                  value={formData.categories}
                  onChange={handleCategoriesChange}
                  input={<OutlinedInput label="Categories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {NEWS_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Select news categories to filter results
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  News Sources (Optional)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label="Add Source"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddSource}
                    disabled={!newSource.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {formData.sources.map((source) => (
                    <Chip
                      key={source}
                      label={source}
                      onDelete={() => handleRemoveSource(source)}
                    />
                  ))}
                  {formData.sources.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No sources specified. Leave empty to include all sources.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Schedule
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  name="frequency"
                  value={formData.schedule.frequency}
                  onChange={handleScheduleChange}
                  label="Frequency"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.schedule.frequency !== 'hourly' && (
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimeField
                    label="Time of Day"
                    value={timeValue}
                    onChange={handleTimeChange}
                    format="HH:mm"
                    fullWidth
                  />
                </LocalizationProvider>
              </Grid>
            )}
            
            {formData.schedule.frequency === 'weekly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                  <Select
                    labelId="day-of-week-label"
                    name="dayOfWeek"
                    value={formData.schedule.dayOfWeek}
                    onChange={handleScheduleChange}
                    label="Day of Week"
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/tasks/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default EditTask;