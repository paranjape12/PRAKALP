import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Buffer } from 'buffer';
import { toast } from 'react-toastify';
import { getUserDataFromToken } from '../../utils/tokenUtils';
// Decrypt token function
function EnableEmployee({ openEnableEmp, CloseEnableEmp, selectedEmployeeId, onEmployeeEnabled }) {  // Correct destructuring of props
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = getUserDataFromToken();
        setUserRole(userData.Type);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const handleEnableEmployee = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/enableEmployee`, {
        empid: selectedEmployeeId,
      });

      if (response.status === 200) {
        onEmployeeEnabled(); // Callback to notify parent component that employee was enabled
        toast.success("successfully Enable Employee");
        CloseEnableEmp(); // Close the dialog after enabling
      } else {
        toast.error('Failed to enable employee. Please try again.');
      }
    } catch (error) {
      console.error('Error enabling employee:', error);
      toast.error('An error occurred while enabling the employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openEnableEmp} onClose={CloseEnableEmp} aria-labelledby="Enable-employee-title">
      <DialogTitle
        id="enable-employee-title"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h6" component="div" color="error" sx={{ fontWeight: 'bold' }}>
          Enable Employee
        </Typography>
        <IconButton edge="end" color="inherit" onClick={CloseEnableEmp} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to enable this employee?
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button style={{ backgroundColor: 'gray', color: 'white' }} onClick={CloseEnableEmp}>
          Cancel
        </Button>
        <Button
          style={{ backgroundColor: '#6495ED', color: 'white' }}
          onClick={handleEnableEmployee}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Enabling...' : 'Yes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EnableEmployee;
