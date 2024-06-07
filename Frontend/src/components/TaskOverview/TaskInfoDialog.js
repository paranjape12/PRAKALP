import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Box, TextField, TableSortLabel
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';


const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const sampleStaticData = [
  {
    date: '2023-10-11',
    employeeName: 'Saurabh Patil',
    timeRequired: '01 : 00',
    timeTaken: '01 : 00',
    activity: 'dummy task activity',
    logs: 'dummy task logs'
  },
  {
    date: '2023-10-19',
    employeeName: 'Saurabh Patil',
    timeRequired: '01 : 30',
    timeTaken: '01 : 00',
    activity: 'dummy task activity',
    logs: 'dummy task logs'
  }
];

const TaskInfoDialog = ({ open, project, task, seconds2dayhrmin, handleClose }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(property);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between" padding="4px">
            <Typography component="span" color="primary" variant="h6" fontSize="20px" fontWeight="700" textAlign="left">
              {project.projectName} &gt;
            </Typography>
            <Typography component="span" color="#b35513" variant="h6" fontSize="15px" fontWeight="700" textAlign="left">
              &nbsp; {task.taskName}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              style={{ marginLeft: 'auto', padding: '4px' }}
            >
              <FontAwesomeIcon icon={faClose} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" padding="4px">
            {task.taskDetails}
          </Typography>
          <Box display="flex" justifyContent="flex-end" my={1} padding="4px">
            <TextField
              margin="dense"
              id="search"
              type="text"
              placeholder="Type to search.."
              inputProps={{ style: { padding: '4px', fontFamily: 'Nunito' } }}
              style={{ padding: '4px' }}
            />
          </Box>
          <TableContainer component={Paper} style={{ padding: '4px' }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ padding: '4px' }}>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={createSortHandler('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '4px' }}>
                    Employee Name
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '4px' }}>
                    <TableSortLabel
                      active={orderBy === 'timeRequired'}
                      direction={orderBy === 'timeRequired' ? order : 'asc'}
                      onClick={createSortHandler('timeRequired')}
                    >
                      Time required (Hr:Min)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '4px' }}>
                    <TableSortLabel
                      active={orderBy === 'timeTaken'}
                      direction={orderBy === 'timeTaken' ? order : 'asc'}
                      onClick={createSortHandler('timeTaken')}
                    >
                      Time Taken (Hr:Min)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ padding: '4px' }}>
                    <TableSortLabel
                      active={orderBy === 'activity'}
                      direction={orderBy === 'activity' ? order : 'asc'}
                      onClick={createSortHandler('activity')}
                    >
                      Activity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ padding: '4px' }}>
                    <TableSortLabel
                      active={orderBy === 'logs'}
                      direction={orderBy === 'logs' ? order : 'asc'}
                      onClick={createSortHandler('logs')}
                    >
                      Logs
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleStaticData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center" sx={{ padding: '4px' }}>{row.date}</TableCell>
                    <TableCell align="left" sx={{ padding: '4px' }}>{row.employeeName}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px' }}>{row.timeRequired}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px' }}>{row.timeTaken}</TableCell>
                    <TableCell align="left" sx={{ padding: '4px' }}>{row.activity}</TableCell>
                    <TableCell align="left" sx={{ padding: '4px' }}>{row.logs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={sampleStaticData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            labelDisplayedRows={({ from, to, count }) => `Showing ${from} to ${to} of ${count} entries`}
            style={{ padding: '4px' }}
          />
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
  
};

export default TaskInfoDialog;
