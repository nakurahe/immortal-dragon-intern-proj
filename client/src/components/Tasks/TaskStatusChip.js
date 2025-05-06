import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

function TaskStatusChip({ active }) {
  return active ? (
    <Chip
      icon={<CheckCircle fontSize="small" />}
      label="Active"
      color="success"
      size="small"
      variant="outlined"
    />
  ) : (
    <Chip
      icon={<Cancel fontSize="small" />}
      label="Inactive"
      color="error"
      size="small"
      variant="outlined"
    />
  );
}

export default TaskStatusChip;