import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, InputLabel } from '@mui/material';
import CreateCopyProject from './CreateCopyProject';
import axios from 'axios';
import { toast } from 'react-toastify';

function AddNewProject({ open, onClose, onSaveFetchProjects }) {
  const [projectName, setProjectName] = useState('');
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [projectSalesOrder, setProjectSalesOrder] = useState('');

  const handleCreateCopyProjectClick = () => {
    setShowMainDialog(false);
    setOpenCopyDialog(true);
  };

  const handleCopyCloseDialog = () => {
    setShowMainDialog(false);
    setOpenCopyDialog(false);
  };

  const handleCopyBackDialog = () => {
    setShowMainDialog(true);
    setOpenCopyDialog(false);
  };
  const handleSubmit = async () => {
    const firstchar = projectSalesOrder.charAt(0);
    const withSpace = projectSalesOrder.length;

    if (projectSalesOrder === '') {
      toast.error("Please enter project sales order");
    } else if (firstchar !== '2' && firstchar !== "I") {
      toast.error("Please enter project sales order with first letter must be '2' or 'I'");
    } else if (withSpace !== 6) {
      toast.error("Sales order length must be equal to 6 characters");
    } else if (projectName === '') {
      toast.error("Please enter project name");
    } else {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/addProject`, {
          ProjectName: projectName,
          sales_order: projectSalesOrder
        });
        if (response.data === "Project exist") {
          toast.error("This project name is already used");
        } else if (response.data === "Error") {
          toast.error("Unable to create a new project");
        } else {
          // Notify the parent to fetch the updated projects
          onSaveFetchProjects();
          toast.success("Project created successfully");
          setProjectName('');
          setProjectSalesOrder('');
          onClose();
        }
      } catch (error) {
        toast.error("Error: Unable to create a new project");
      }
    }


  };

  return (
    <>
      {showMainDialog && (
        <Dialog open={open} onClose={onClose} PaperProps={{
        }}>
          <DialogTitle style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
            Add New Project
            <Button onClick={handleCreateCopyProjectClick} style={{ float: 'right', backgroundColor: '#858796', color: 'white', fontFamily: 'Nunito', textTransform: 'capitalize', marginLeft: '5rem' }}>
              Create Copy Project
            </Button>
          </DialogTitle>
          <hr style={{ margin: '0', color: '#b2babb', backgroundColor: '#b2babb', }} />
          <DialogContent>
            <InputLabel style={{ fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px' }}>Sales Order</InputLabel>
            <TextField
              id='outlined-salesorder'
              placeholder='Enter Sales Order'
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              inputProps={{ style: { padding: '20px', fontFamily: 'Nunito' } }}
              value={projectSalesOrder}
              onChange={(e) => setProjectSalesOrder(e.target.value)}
            />
            <InputLabel style={{ fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', }}>Project Name</InputLabel>
            <TextField
              id='outlined-projname'
              placeholder='Enter Project Name'
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              inputProps={{ style: { padding: '20px', fontFamily: 'Nunito' } }}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
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
      {openCopyDialog && <CreateCopyProject open={openCopyDialog} onClose={handleCopyCloseDialog} onBack={handleCopyBackDialog} />}
    </>
  );
}

export default AddNewProject;
