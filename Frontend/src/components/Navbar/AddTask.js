import React, { useState } from 'react';
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

const AddTaskModal = ({ open, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [lastTask, setLastTask] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="addnewTitle">
      <DialogTitle id="addnewtask" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df',fontWeight:'700', fontSize:'30px'}}>
            Add New Task</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel id="addprojdrop-label"
            style={{ margin: '5px' }} >Select Project</InputLabel>
          <Select
            labelId="addprojdrop-label"
            id="addprojdrop"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            label="Select Project"
            style={{ margin: '5px' }}
          >
            <MenuItem value="Unassigned/ No Work">Unassigned/ No Work</MenuItem>
          </Select>
        </FormControl>
        <InputLabel style={{ fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '18px' }}>Task Details</InputLabel>
        <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px' }}>Task Name</InputLabel>
        <TextField
          autoFocus
          margin="dense"
          id="addtaskname"
          type="text"
          fullWidth
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          inputProps={{ style: { padding: '25px', fontFamily: 'Nunito' } }}
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
          variant="standard"
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
          variant="standard"
          margin="dense"
          id="addprojmin"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" style={{ outline: 'none' }}>Min</InputAdornment>
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
