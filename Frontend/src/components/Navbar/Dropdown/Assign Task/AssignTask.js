import React, { useState,useEffect } from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,TextField,Button,Select,MenuItem,FormControl,InputLabel } from '@mui/material';
import './AssignTask.css'
import axios from 'axios';


const AssignTaskDialog = ({ open, onClose }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [date, setDate] = useState('');
  const [activity, setActivity] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  
  const handleSave = () => {
    onClose();
  };

  const handleClose = () => {
    onClose();
  };


  //select project api 
  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  //api 
  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getProjectNames');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  //Select Employee api 
  const fetchEmployees = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/empDropdown', {
        token: localStorage.getItem('token'),
      });
      setSelectedEmployee('');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle id="assigntask" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
        Assign Task</DialogTitle>
      <DialogContent>
        <div>
          <FormControl style={{ marginTop: '1rem' , marginRight:'3rem', marginBottom: '1rem' }}>
            <InputLabel>Select Project</InputLabel>
            <Select
              label="Select Project"
              id="addprojdrop"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((project, index) => (
                <MenuItem key={index} value={project}>
                  {project}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{ marginTop: '1rem'}}>
            <InputLabel>Select Employee</InputLabel>
            <Select
            id="selempdrop"
              label="Select Employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.Name}>
                  {employee.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <InputLabel style={{ fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '18px', marginBottom:'1rem' }}>Task Details</InputLabel>
        <div style={{ display: 'flex' }}>
          <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px', marginRight: '2.5rem' }}>Date</InputLabel>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            label="Date"
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: '2rem' }}
          />
        </div>
        <div style={{ display: 'flex' }}>
          <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px', marginRight: '1rem' }}>Activity</InputLabel>
          <TextField
          id="activitytxtfield"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder='Enter Activity Name'
            multiline
            rows={2}
            style={{ width: '75%' }}            
          />
        </div>
      </DialogContent>
      <DialogActions>        
      <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={handleClose} color="primary">
          Close
        </Button>
        <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTaskDialog;