import React from 'react'
import {Dialog,DialogTitle,DialogContent, DialogActions,Button,Typography,IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import { getUserDataFromToken } from '../../utils/tokenUtils';

function DeleteEmployeePopup({ open, handleClose,selectedEmployeeId, onEmployeeDeleted }) {
  const navigate = useNavigate();
  
  const [userRole, setUserRole] = useState('');

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

  const handleDeleteEmployee = async () => {
      try {
          const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/deleteEmployee`, {
              empid: selectedEmployeeId
          });
          if (response.status === 200) {
              const data = response.data;
              toast.success("Employee deleted successfully!");
              if (data.message === 'Success') {
                  console.log("Employee deleted successfully!");
                  if (userRole === 'Employee') {
                      localStorage.clear();
                      setTimeout(() => {
                          navigate("/"); // Redirect using React Router
                      }, 1000);
                  } else if (userRole === 'Team Leader' || userRole === 'Admin' ) {
                      setTimeout(() => {
                         onEmployeeDeleted(); // Notify parent about deletion
                          handleClose() // Redirect using React Router
                      }, 1000);
                  } else {
                      setTimeout(() => {
                          navigate("/"); // Redirect using React Router
                      }, 2000);
                  }
              } else {
                  console.log("Could not delete the employee!");
                  setTimeout(handleClose, 1500);
              }
          } else {
              console.log("Could not delete the employee!");
              setTimeout(handleClose, 1500);
          }
      } catch (error) {
          console.error('Error:', error);
          setTimeout(handleClose, 1500);
      }
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="delete-employee-title">
      <DialogTitle id="delete-employee-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" color="error" sx={{ fontWeight: 'bold' }}>
          Disable Employee
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <input type="hidden" id="deleteproidinput" />
        <Typography variant="body1">
          Are you sure you want to disable this Employee?
      </Typography>
      </DialogContent>
      <DialogActions>
        <Button style={{ backgroundColor: 'gray', color: 'white' }} onClick={handleClose}>
          Cancel
        </Button>
        <Button style={{ backgroundColor: '#6495ED', color: 'white' }} onClick={handleDeleteEmployee} >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteEmployeePopup;
