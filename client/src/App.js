import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/common/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Tasks from './components/Tasks/Tasks';
import TaskDetail from './components/Tasks/TaskDetail';
import CreateTask from './components/Tasks/CreateTask';
import EditTask from './components/Tasks/EditTask';
import Results from './components/Results/Results';
import ResultDetail from './components/Results/ResultDetail';
import Chat from './components/Chat/Chat';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/:id/edit" element={<EditTask />} />
          <Route path="/tasks/:taskId/results" element={<Results />} />
          <Route path="/results/:resultId" element={<ResultDetail />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;