import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const DeleteTaskPopup = ({ open, handleClose, task }) => {

  

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming you store your token in localStorage
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/deleteTask`, { taskId: task.taskId, token });
      
      if (response.data === 'Success') {
        toast.success('Task deleted successfully.');
        setTimeout(() => {
          handleClose();
          // Optionally, trigger a refresh of the task list or redirect the user
        }, 1500);
      } else {
        toast.error('Error deleting task.');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="delete-project-title" maxWidth="sm" fullWidth>
        <DialogTitle id="delete-project-title" style={{ textAlign: 'left', color: 'red', fontWeight: '700', fontSize: '30px' }}>
          Delete Task<FontAwesomeIcon onClick={handleClose} icon={faTimes} style={{ color: 'gray', marginLeft: '22rem', cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
        <div style={{ textAlign: 'center' }}>Are you sure you want to permanently remove the task</div>
        <div style={{ fontWeight: '700', textAlign: 'center' }}>"{task.taskName || task.TaskName}" ?</div>
        </DialogContent>
        <DialogActions>
          <Button style={{ backgroundColor: 'gray', color: 'white' }} onClick={handleClose}>
            Cancel
          </Button>
          <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleDelete}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DeleteTaskPopup;
