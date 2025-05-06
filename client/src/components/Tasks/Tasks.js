import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import DeleteTaskDialog from './DeleteTaskDialog';
import TaskStatusChip from './TaskStatusChip';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/tasks');
        setTasks(response.data.tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Handle run task
  const handleRunTask = async (taskId) => {
    try {
      await api.post(`/api/tasks/${taskId}/run`);
      // Optionally show a success message
    } catch (err) {
      console.error('Error running task:', err);
      // Show error message
    }
  };

  // Handle delete dialog
  const openDeleteDialog = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await api.delete(`/api/tasks/${taskToDelete._id}`);
      setTasks(tasks.filter(task => task._id !== taskToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      console.error('Error deleting task:', err);
      // Show error message
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter tasks based on active status
  const filteredTasks = showInactive
    ? tasks
    : tasks.filter(task => task.active);

  // Apply pagination
  const paginatedTasks = filteredTasks
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">News Analysis Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/create')}
        >
          Create Task
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Task List</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Show Inactive Tasks"
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Keywords</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No tasks found. Create your first task to start analyzing news.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {task.name}
                      </Typography>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {task.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
                        {task.keywords.slice(0, 3).map((keyword) => (
                          <Chip key={keyword} label={keyword} size="small" />
                        ))}
                        {task.keywords.length > 3 && (
                          <Chip 
                            label={`+${task.keywords.length - 3}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {task.schedule.frequency.charAt(0).toUpperCase() + task.schedule.frequency.slice(1)}
                      </Typography>
                      {task.schedule.frequency !== 'hourly' && (
                        <Typography variant="body2" color="text.secondary">
                          {task.schedule.frequency === 'daily' 
                            ? `at ${task.schedule.timeOfDay}`
                            : `on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][task.schedule.dayOfWeek]} at ${task.schedule.timeOfDay}`
                          }
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.nextRun ? (
                        format(new Date(task.nextRun), 'PPp')
                      ) : (
                        'Not scheduled'
                      )}
                    </TableCell>
                    <TableCell>
                      <TaskStatusChip active={task.active} />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Run Now">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleRunTask(task._id)}
                            disabled={!task.active}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton 
                            color="info" 
                            onClick={() => navigate(`/tasks/${task._id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Results">
                          <IconButton 
                            color="secondary" 
                            onClick={() => navigate(`/tasks/${task._id}/results`)}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="success" 
                            onClick={() => navigate(`/tasks/${task._id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => openDeleteDialog(task)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        taskName={taskToDelete?.name}
      />
    </Box>
  );
}

export default Tasks;