import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, InputAdornment, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import './AssignTask.css'
import axios from 'axios';

const AssignTaskDialog = ({ open, onClose }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [date, setDate] = useState('');
  const [activity, setActivity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');

  const handleSave = () => {
    const data = {
      valuetask: selectedTask,
      inputminaray: minutes,
      inputhraray: hours,
      Activity: activity,
      Dateassign: date,
      token: localStorage.getItem('token'),
    };

    axios.post('http://localhost:3001/api/assignTask', data)
      .then(response => {
        setSuccessMessage(response.data);
        setTimeout(() => {
          onClose();
        }, 1500);
      })
      .catch(error => {
        console.error('Error assigning task:', error);
        setErrorMessage('Failed to assign task. Please try again.');
      });
  };

  const handleClose = () => {
    onClose();
  };

  // Select project API
  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      // Fetch tasks based on the selected project
      axios.get(`http://localhost:3001/api/task?projectName=${selectedProject}`)
        .then((response) => {
          setTasks(response.data);
        })
        .catch((error) => {
          console.error('Error fetching tasks:', error);
        });
    }
  }, [selectedProject]);

  // API to fetch projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getProjectNames');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // API to fetch employees
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
        Assign Task
      </DialogTitle>
      <DialogContent>
        <div>
          <FormControl style={{ marginTop: '1rem', marginRight: '3rem', marginBottom: '1rem' }}>
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
          {selectedProject && (
            <FormControl style={{ marginTop: '1rem', marginRight: '3rem', marginBottom: '1rem' }}>
              <InputLabel>Select Task</InputLabel>
              <Select
                label="Select Task"
                id="taskdrop"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                {tasks.map((task, index) => (
                  <MenuItem key={index} value={task.id}>
                    {task.TaskName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              id="selempdrop"
              label="Select Employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <InputLabel style={{ fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '18px', marginBottom: '1rem' }}>Task Details</InputLabel>
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
            style={{ marginBottom: '0.5rem' }}
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
            style={{ width: '75%', marginBottom: '0.5rem' }}
          />
        </div>
        {selectedEmployee && (
          <div style={{ display: 'flex' }}>
            <TextField
              style={{ marginRight: '1rem' }}
              margin="dense"
              id="addprojhr"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
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
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" style={{ outline: 'none', }}>Min</InputAdornment>
                ),
                style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
                inputProps: { min: 0, max: 59, style: { padding: '25px' } }
              }}
            />
          </div>
        )}

        {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{errorMessage}</p>}
        {successMessage && (
          <div className="text-center">
            <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMessage}</p>
          </div>
        )}

      </DialogContent>
      <DialogActions>
        <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={handleClose} color="primary">
          Close
        </Button>
        {selectedTask && (
          <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSave} color="primary">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignTaskDialog;
