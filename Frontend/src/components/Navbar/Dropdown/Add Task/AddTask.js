import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, FormControlLabel, InputLabel, MenuItem, Select,
  TextField,
} from '@mui/material';
import './AddTask.css'
import axios from 'axios';
import { toast } from 'react-toastify';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const AddTaskModal = ({ projectName, open, onClose, onSaveFetchProjects }) => {
  const [taskName, setTaskName] = useState('');
  const [lastTask, setLastTask] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [minAssign, setMinAssign] = useState(0);
  const [assignDate, setAssignDate] = useState(new Date().toISOString().substr(0, 10));
  const [hrAssign, setHrAssign] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectName || '');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [taskDetails, setTaskDetails] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    // Validation checks
    if (selectedProject === '') {
      toast.error('Select at least one project');
      return;
    }
    if (hours === 0 && minutes === 0) {
      toast.error('Please enter time required to complete the task');
      return;
    }
    if (hours > 99 || minutes > 59) {
      toast.error('Hours limit must be less than 100 and minutes limit must be less than 60');
      return;
    }
    if (!selectedEmployee.id) {
      toast.error('Select an employee');
      return;
    }
    if (taskName === '') {
      toast.error('Please enter task name');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/createTask`, {
        ProjectName: selectedProject,
        TaskName: taskName,
        Empname: selectedEmployee.name, // passing employee name
        AssignTo: selectedEmployee.id,  // passing employee's ID
        islasttask: lastTask ? 1 : 0,
        taskdetails: taskDetails,
        hr: hours,
        min: minutes,
        assignDate: assignDate,
        hrAssign: hrAssign,
        minAssign: minAssign,
        token: localStorage.getItem('token'),
      });

      if (response.data === 'Success') {
        onSaveFetchProjects();
        toast.success('Task added successfully!');
        setTimeout(onClose, 2500);
      } else if (response.data === 'Last Task exist') {
        toast.warning('Already Last Task exist');
      }

    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Error saving task');
    } finally {
      setTaskName('');
      setLastTask(false);
      setHours(0);
      setMinutes(0);
      setMinAssign(0);
      setAssignDate(new Date().toISOString().substr(0, 10));
      setHrAssign(0);
      setSelectedProject(projectName || '');
      setSelectedEmployee('');
      setTaskDetails('');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/getProjectNames`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  //Select Employee api 
  const fetchEmployees = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/empDropdown`, {
        token: localStorage.getItem('token'),
      });
      setSelectedEmployee('');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="addnewTitle" maxWidth='lg'>
        <DialogTitle id="addnewtask" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
          Add New Task
        </DialogTitle><hr style={{ margin: '0', color: '#b2babb', backgroundColor: '#b2babb', }} />
        <DialogContent>
          <div>
            <FormControl style={{ marginRight: '3rem' }}>
              <InputLabel >Select Project</InputLabel>
              <Select
                label="Select Project"
                id="addprojdrop"
                size='small'
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{ fontFamily: 'Nunito', width: '15rem' }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400,
                      width: '25rem',
                    },
                  },
                }}
              >
                {projects.map((project, index) => (
                  <MenuItem key={index} value={project} dense>
                    {project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl >
              <InputLabel >Select Employee</InputLabel>
              <Select
                id="selempdrop"
                label="Select Employee"
                size="small"
                value={selectedEmployee?.id || ''} // Use selectedEmployee.id or fallback to an empty string
                onChange={(e) => {
                  const employeeId = e.target.value;
                  const selectedEmp = employees.find(emp => emp.id === employeeId);
                  setSelectedEmployee(selectedEmp); // Store the full employee object
                }}
                style={{ fontFamily: 'Nunito', width: '15rem' }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400,
                      width: '10rem',
                    },
                  },
                }}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id} dense>
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
          <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px' }}>Required Time</InputLabel>
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
              inputProps: { min: 0, max: 12, style: { padding: '1.3rem' } }
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
              inputProps: { min: 0, max: 59, style: { padding: '1.3rem' } }
            }}
          />

          {selectedEmployee && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '2.5rem' }}>
                  <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px', marginTop: '0.5rem' }}>Assign Date</InputLabel>
                  <TextField
                    type="date"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{ marginBottom: '0.5rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InputLabel
                    style={{
                      fontFamily: 'Nunito',
                      color: 'Black',
                      fontWeight: '700',
                      fontSize: '18px',
                      marginTop: '0.25rem',
                      marginBottom: '0',
                    }}>
                    Planned Time
                  </InputLabel>
                  <div style={{ display: 'flex', marginTop: '0.25rem' }}>
                    <TextField
                      margin="dense"
                      id="addprojhr_emp_assign"
                      type="number"
                      value={hrAssign}
                      onChange={(e) => setHrAssign(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end" style={{ outline: 'none' }}>Hr</InputAdornment>
                        ),
                        style: {
                          fontFamily: 'Nunito',
                          color: 'black',
                          fontWeight: '700',
                          fontSize: '18px',
                          border: 'none',
                          marginTop: '0'
                        },
                        inputProps: { min: 0, max: 12, style: { padding: '1.3rem' } }
                      }}
                      style={{ marginRight: '1rem' }}
                    />
                    <TextField
                      margin="dense"
                      size="small"
                      id="addprojmin_emp_assign"
                      type="number"
                      value={minAssign}
                      onChange={(e) => setMinAssign(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end" style={{ outline: 'none' }}>Min</InputAdornment>
                        ),
                        style: {
                          fontFamily: 'Nunito',
                          color: 'black',
                          fontWeight: '700',
                          fontSize: '18px',
                          border: 'none'
                        },
                        inputProps: { min: 0, max: 59, style: { padding: '1.3rem' } }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <TextField
            margin="dense"
            id="addtaskdetails"
            label="Description"
            multiline
            fullWidth
            value={taskDetails}
            onChange={(e) => setTaskDetails(e.target.value)}
          />

        </DialogContent>
        <DialogActions>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={handleClose} color="primary">
            Close
          </Button>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default AddTaskModal;
