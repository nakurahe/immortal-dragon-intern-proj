import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

function DeleteTaskDialog({ open, onClose, onConfirm, taskName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-task-dialog-title"
      aria-describedby="delete-task-dialog-description"
    >
      <DialogTitle id="delete-task-dialog-title">
        Delete Task
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-task-dialog-description">
          Are you sure you want to delete the task "{taskName}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteTaskDialog;