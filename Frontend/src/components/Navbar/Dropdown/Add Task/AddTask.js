import React, { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import './AddTask.css'
import axios from 'axios';

const AddTaskModal = ({ open, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [lastTask, setLastTask] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    onClose();
  };



  //select project api 
  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getProjectNames');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

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
    <Dialog open={open} onClose={handleClose} aria-labelledby="addnewTitle">
      <DialogTitle id="addnewtask" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
        Add New Task</DialogTitle>
      <DialogContent>
        <div>
          <FormControl style={{ marginTop: '1rem', marginRight: '3rem' }}>
            <InputLabel >Select Project</InputLabel>
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
          <FormControl style={{ marginTop: '1rem' }}>
            <InputLabel >Select Employee</InputLabel>
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
        <InputLabel style={{ fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '18px', marginTop: '1rem' }}>Task Details</InputLabel>
        <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px' }}>Task Name</InputLabel>
        <TextField
          autoFocus
          margin="dense"
          id="addtaskname"
          type="text"
          placeholder='Task Name Enter'
          fullWidth
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          inputProps={{ style: { padding: '0.5rem', fontFamily: 'Nunito' } }}
        />

        <FormControlLabel
          control={<Checkbox
            checked={lastTask}
            onChange={(e) => setLastTask(e.target.checked)}
            id="islasttask"
          />}
          label="Last Task"
        />
        <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px' }}>Time Required For Task</InputLabel>
        <TextField
          style={{ marginRight: '1rem' }}
          margin="dense"
          id="addprojhr"
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" style={{ outline: 'none' }}>Hr</InputAdornment>
            ),
            style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
            inputProps: { min: 0, max: 12, style: { padding: '25px' } }
          }}
        />
        <TextField

          margin="dense"
          id="addprojmin"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" style={{ outline: 'none', }}>Min</InputAdornment>
            ),
            style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
            inputProps: { min: 0, max: 59, style: { padding: '25px' } }
          }}
        />
        <TextField
          margin="dense"
          id="addtaskdetails"
          label="Description"
          multiline
          fullWidth
        />
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

export default AddTaskModal;
