import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, InputLabel, Select} from '@mui/material';



function CreateCopyProject({open,onClose,onBack}) {
  const [projectName, setProjectName] = useState('');
  const [salesOrder, setSalesOrder] = useState('');
 
  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    onBack();
  };
 
  const handleSelectChange = (e) => {
    // Handle select change if needed
    console.log(e.target.value);
  };  


  const handleSubmit = (event) => {
    event.preventDefault();
    // Submit the data to your backend here
    console.log('Project name:', projectName);
    console.log('Sales order:', salesOrder);
  };

  return (
                <Dialog open={open} onClose={onClose}>
                <DialogTitle style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df',fontWeight:'700', fontSize:'30px'}}>
                    Add New Project
                    <Button style={{ float: 'right', backgroundColor: '#858796', color: 'white', fontFamily: 'Nunito', textTransform: 'capitalize', marginLeft:'10rem' }} onClick={onBack} color="primary">
                    Back
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
                <DialogContent>
                <Select
                    className="col-md-12 form-select border border-primary rounded p-1"
                    aria-label="Default select example"
                    id="assignaddprojdropproj"
                    onChange={handleSelectChange}
                    defaultValue="" // Set default value if needed
                    >
                    {/* <MenuItem value="" disabled>Select Project</MenuItem>
                    {projectNameArray.map((value) => (
                        <MenuItem key={value} value={value}>{value}</MenuItem> */}
                    {/* ))} */}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={onClose} color="primary">
                    Close
                    </Button>
                    <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={onClose} color="primary">
                    Save
                    </Button>
                </DialogActions>
                </Dialog>
  );
}

export default CreateCopyProject;