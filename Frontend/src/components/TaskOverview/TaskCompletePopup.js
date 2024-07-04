import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  InputLabel,
  InputAdornment,
  
} from '@mui/material';


const TaskCompletePopup=({ open, handleClose, handleSave }) => {
  const [taskComplete, setTaskComplete] = useState(false);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [taskNotComplete, setTaskNotComplete] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [log, setLog] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const theme = createTheme({
    typography: {
      fontFamily: 'Nunito, sans-serif',
    },
  });

  const handleTaskCompleteChange = () => {
    setTaskComplete(!taskComplete);
    setTaskInProgress(false);
    setTaskNotComplete(false);
  };

  const handleTaskInProgressChange = () => {
    setTaskInProgress(!taskInProgress);
    setTaskComplete(false);
    setTaskNotComplete(false);
  };

  const handleTaskNotCompleteChange = () => {
    setTaskNotComplete(!taskNotComplete);
    setTaskComplete(false);
    setTaskInProgress(false);
  };

  const handleSaveClick = () => {
    // Add validation and save logic here
    if (hours < 0 || hours > 8 || minutes < 0 || minutes > 59) {
      setErrorMessage('Invalid time input');
    } else {
      setErrorMessage('');
      handleSave({ hours, minutes, log, taskComplete, taskInProgress, taskNotComplete });
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <Dialog open={open} onClose={handleClose} aria-labelledby="time-complete-title" maxWidth="sm" fullWidth  // This ensures it doesn't exceed the width of 'sm'
      sx={{
        top: '0%', // Adjust the value as needed
        '& .MuiDialog-paper': {
          width: '80%', // Custom width, adjust as needed
          maxWidth: '500px', // Maximum width
        },
      }} 
      style={{bottom:"32%", margin:"0", position:"absolute" }} >
    <DialogTitle id="time-complete-title" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '24px', padding:"0", marginTop:"1rem", marginLeft:"1rem" }}>
      Time taken To Complete Task 
      <hr padding ="0" />
    </DialogTitle>
    <DialogContent>
      <Grid container >
        {/* <Grid item xs={12}>
        <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '16px' }}>Time Taken</InputLabel>
          <TextField
            hidden
            id="inputidhide"
            variant="outlined"
            InputProps={{ readOnly: true }}
          />
        </Grid> */}
                <Box display="flex" alignItems="center"  className="col-md-12"  >
            <input type="hidden" id="inputidhide" />
            
            <TextField
            style={{ marginRight: '1rem', width: '9rem' }}
            margin="dense"
            id="addprojhr"
            size='small'
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
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
            onChange={(e) => setMinutes(Number(e.target.value))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ outline: 'none' }}>Min</InputAdornment>
              ),
              style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
              inputProps: { min: 0, max: 59, style: { padding: '1.3rem' } }
            }}
          />
            </Box>
      
        <Grid item xs={10} marginTop={1} marginLeft={2}>
          <Box display="flex" justifyContent="left" alignItems="left">
            <FormControlLabel
              control={
                <Checkbox
                  checked={taskComplete}
                  onChange={handleTaskCompleteChange}
                  name="taskComplete"
                  color="primary"
                />
              }
              label="Task Complete"
              sx={{
                backgroundColor: '#04FF00',
                borderRadius: '6rem',
                padding: '0.1rem',
                pr: 2,
                fontFamily: 'Nunito, sans-serif'
              }}
            />
            <FormControlLabel marginLeft="1"
              control={
                <Checkbox
                  checked={taskInProgress}
                  onChange={handleTaskInProgressChange}
                  name="taskInProgress"
                  color="primary"
                />
              }
              label="Task in Progress"
              sx={{
                backgroundColor: '#FFFF00',
                borderRadius: '6rem',
                padding: '0.1rem',
                pr: 2,
                fontFamily: 'Nunito, sans-serif'
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={taskNotComplete}
                  onChange={handleTaskNotCompleteChange}
                  name="taskNotComplete"
                  color="primary"
                />
              }
              label="Task not Complete"
              sx={{
                backgroundColor: '#FF0000',
                borderRadius: '6rem',
                padding: '0.1rem',
                pr: 2,
                fontFamily: 'Nunito, sans-serif'
              }}
              style={{ display: 'none' }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} marginLeft={1}>
        
          <TextField
            margin="dense"
            variant="outlined"
            label="Logs"
            placeholder="Data logs and part number issue"
            value={log}
            onChange={(e) => setLog(e.target.value)}
            multiline
            fullWidth
            sx={{ fontFamily: 'Nunito, sans-serif' }}
          />
        </Grid>
        {errorMessage && (
          <Grid item xs={12}>
            <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{errorMessage}</p>
          </Grid>
        )}
      </Grid>
    </DialogContent>
    
    <DialogActions>
      <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white',  }} onClick={handleClose} color="primary">
        Cancel
      </Button>
      <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white'  }} onClick={handleSaveClick} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
  </ThemeProvider>
  )
}

export default TaskCompletePopup
