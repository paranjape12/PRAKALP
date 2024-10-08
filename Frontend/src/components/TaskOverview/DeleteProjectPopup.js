import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});



const DeleteProjectPopup = ({ open, handleClose, selectedProjectId, projectName, onSaveFetchProjects }) => {
  const [isDeleting, setIsDeleting] = useState(false); // New state to track deletion in progress

  const handleDelete = async () => {
    setIsDeleting(true); // Set to true when delete starts
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/deleteProject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projid: selectedProjectId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'Success') {
          onSaveFetchProjects();
          toast.success("Project deleted Successfully !");
          setTimeout(handleClose, 1000);
        } else {
          toast.error("Could not delete the project !");
          setTimeout(handleClose, 1500);
        }
      } else {
        toast.error("Could not delete the project !");
        setTimeout(handleClose, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Could not delete the project !");
      setTimeout(handleClose, 1500);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="delete-project-title" maxWidth="sm" fullWidth>
        <DialogTitle id="delete-project-title" style={{ textAlign: 'left', color: 'red', fontWeight: '700', fontSize: '30px' }}>
          Delete Project<FontAwesomeIcon onClick={handleClose} icon={faTimes} style={{ color: 'gray', marginLeft: '20rem', cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <div style={{ textAlign: 'center' }}>Are you sure you want to permanently remove the project</div>
          <div style={{ fontWeight: '700', textAlign: 'center' }}>"{projectName}" ?</div>
        </DialogContent>
        <DialogActions>
          {!isDeleting && ( // Conditionally render buttons only if not deleting
            <>
              <Button style={{ backgroundColor: 'gray', color: 'white' }} onClick={handleClose}>
                Cancel
              </Button>
              <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleDelete}>
                Yes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DeleteProjectPopup;
