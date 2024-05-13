import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, InputLabel} from '@mui/material';
import CreateCopyProject  from './CreateCopyProject';

function AddNewProject({open,onClose}) {
  const [projectName, setProjectName] = useState('');
  const [salesOrder, setSalesOrder] = useState('');
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [showMainDialog, setShowMainDialog] = useState(true);

  const handleCreateCopyProjectClick = () => {
    setShowMainDialog(false);
    setOpenCopyDialog(true);
  };

  const handleCopyCloseDialog = () => {
    setShowMainDialog(true);
    setOpenCopyDialog(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Submit the data to your backend here
    console.log('Project name:', projectName);
    console.log('Sales order:', salesOrder);
  };

  return (
    <>
      {showMainDialog && (
        <Dialog open={open} onClose={onClose}>
          <DialogTitle style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df',fontWeight:'700', fontSize:'30px'}}>
            Add New Project
            <Button onClick={handleCreateCopyProjectClick} style={{ float: 'right', backgroundColor: '#858796', color: 'white', fontFamily: 'Nunito', textTransform: 'capitalize', marginLeft:'10rem' }} color="primary">
              Create Copy Project
            </Button>
          </DialogTitle>
          <DialogContent>
            <InputLabel style={{ fontFamily: 'Nunito', color:'black', fontWeight:'700', fontSize:'18px' }}>Sales Order</InputLabel>
            <TextField
              id='outlined-salesorder'
              placeholder='Enter Sales Order'
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              inputProps={{ style: { padding: '25px', fontFamily: 'Nunito' } }}
            />
            <InputLabel style={{ fontFamily: 'Nunito', color:'black', fontWeight:'700', fontSize:'18px', }}>Project Name</InputLabel>
            <TextField
              id='outlined-projname'
              placeholder='Enter Project Name'
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              inputProps={{ style: { padding: '25px', fontFamily: 'Nunito' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={onClose} color="primary">
              Close
            </Button>
            <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSubmit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {openCopyDialog && <CreateCopyProject open={openCopyDialog} onClose={handleCopyCloseDialog} />}
    </>
  );
}

export default AddNewProject;
