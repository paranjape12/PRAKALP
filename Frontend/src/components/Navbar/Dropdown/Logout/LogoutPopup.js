import React from 'react'
import {Dialog,DialogTitle,DialogContent, DialogActions,Button,Typography,IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';

function LogoutPopup({open,handleClose}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('filterState');
    if (localStorage.getItem('filterStateAdmin')) {
      localStorage.removeItem('filterStateAdmin');
    }
    window.location.href = 'https://prakalp2.mydashboard.site/index.php';
  };

  return (
   <>
   <Dialog open={open} onClose={handleClose} aria-labelledby="logout" maxWidth={'xs'}> 
      <DialogTitle id="logout" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" color=" #e74c3c" sx={{ fontWeight: 'bold' }}>
         Ready to Leave?
        </Typography>
          <CloseIcon edge="end" color="inherit" onClick={handleClose} aria-label="close"/>
      </DialogTitle>
       <hr style={{margin:'0',color:'#b2babb',backgroundColor:'#b2babb',}} />
      <DialogContent>
        <Typography variant="body1" color={'#707b7c'}>
        Select "Logout" below if you are ready to end your current session.
      </Typography>
      </DialogContent>
      <hr style={{margin:'0',color:'#b2babb',backgroundColor:'#b2babb',}} />
      <DialogActions>
        <Button style={{ backgroundColor: 'gray', color: 'white' }} onClick={handleClose}>
          Cancel
        </Button>
        <Button style={{ backgroundColor: '#6495ED', color: 'white' }} onClick={handleLogout} >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
   </>
  )
}

export default LogoutPopup
