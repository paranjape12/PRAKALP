import React, { useState, useEffect } from 'react';
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

const TaskInfoDialog = ({ open, project, task, taskDetails, handleClose, fetchTaskDetails }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [filteredTaskDetails, setFilteredTaskDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const seconds2hrmin = (ss) => {
    const s = ss % 60;
    const h = Math.floor(ss / 3600); // Total hours
    const m = Math.floor((ss % 3600) / 60); // Remaining minutes

    const formattedH = h < 10 ? '0' + h : h;
    const formattedM = m < 10 ? '0' + m : m;

    return `${formattedH}:${formattedM}`;
  };


  useEffect(() => {
    fetchTaskDetails();
    if (taskDetails && taskDetails.results && taskDetails.results.length > 0) {
      // Set filtered task details dynamically
      setFilteredTaskDetails(taskDetails.results);
    }
  }, [taskDetails]);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const offset = date.getTimezoneOffset(); // Get time zone offset in minutes
    const adjustedDate = new Date(date.getTime() - offset * 60000); // Adjust date for time zone offset
    return adjustedDate.toISOString().split('T')[0];
  };

  const sortedTaskDetails = [...filteredTaskDetails].sort((a, b) => {
    if (orderBy === 'date') {
      return order === 'asc'
        ? new Date(a.tasktimeemp) - new Date(b.tasktimeemp)
        : new Date(b.tasktimeemp) - new Date(a.tasktimeemp);
    } else if (orderBy === 'timeRequired') {
      const timeA = a.timetocomplete_emp.split(':').reduce((acc, curr, index) => acc + parseInt(curr) * (index === 0 ? 3600 : 60), 0);
      const timeB = b.timetocomplete_emp.split(':').reduce((acc, curr, index) => acc + parseInt(curr) * (index === 0 ? 3600 : 60), 0);
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    } else if (orderBy === 'timeTaken') {
      const timeA = a.actualtimetocomplete_emp.split(':').reduce((acc, curr, index) => acc + parseInt(curr) * (index === 0 ? 3600 : 60), 0);
      const timeB = b.actualtimetocomplete_emp.split(':').reduce((acc, curr, index) => acc + parseInt(curr) * (index === 0 ? 3600 : 60), 0);
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    } else if (orderBy === 'activity') {
      return order === 'asc'
        ? a.Activity.localeCompare(b.Activity)
        : b.Activity.localeCompare(a.Activity);
    } else if (orderBy === 'logs') {
      return order === 'asc'
        ? a.tasklog.localeCompare(b.tasklog)
        : b.tasklog.localeCompare(a.tasklog);
    }
    return 0;
  });

  const filteredTasks = sortedTaskDetails.filter((task) => {
    const searchLowerCase = searchQuery.toLowerCase();
    return (
      task.Name.toLowerCase().includes(searchLowerCase) ||
      task.tasklog.toLowerCase().includes(searchLowerCase) ||
      task.Activity.toLowerCase().includes(searchLowerCase) ||
      formatDate(task.tasktimeemp).includes(searchLowerCase)
    );
  });

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between" padding="4px">
            <Typography component="span" color="primary" variant="h6" fontSize="20px" fontWeight="700" textAlign="left">
              {project.projectName} &gt;
            </Typography>
            <Typography component="span" color="#b35513" variant="h6" fontSize="15px" fontWeight="700" textAlign="left">
              &nbsp; {task.taskName || task.TaskName}
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
          <Typography variant="body2" color="textSecondary">
            {task.taskDetails}
          </Typography>
          <Box display="flex" justifyContent="flex-end" >
            <TextField
              margin="dense"
              id="search"
              type="text"
              placeholder="Type to search.."
              style={{ marginTop: '0' }}
              inputProps={{ style: { marginTop: '0', padding: '4px', fontFamily: 'Nunito' } }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <TableContainer component={Paper} style={{ padding: '0.5px' }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontWeight: '700' }}>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={createSortHandler('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid black', padding: '2px', fontWeight: '700', textAlign: 'center' }}>
                    Employee Name
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid black', padding: '2px', fontWeight: '700', textAlign: 'center' }}>
                    <TableSortLabel
                      active={orderBy === 'timeRequired'}
                      direction={orderBy === 'timeRequired' ? order : 'asc'}
                      onClick={createSortHandler('timeRequired')}
                    >
                      Time required (Hr:Min)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid black', padding: '2px', fontWeight: '700', textAlign: 'center' }}>
                    <TableSortLabel
                      active={orderBy === 'timeTaken'}
                      direction={orderBy === 'timeTaken' ? order : 'asc'}
                      onClick={createSortHandler('timeTaken')}
                    >
                      Time Taken (Hr:Min)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ border: '1px solid black', padding: '2px', fontWeight: '700', textAlign: 'center' }}>
                    <TableSortLabel
                      active={orderBy === 'activity'}
                      direction={orderBy === 'activity' ? order : 'asc'}
                      onClick={createSortHandler('activity')}
                    >
                      Activity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ border: '1px solid black', padding: '2px', fontWeight: '700', textAlign: 'center' }}>
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
                {filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center" sx={{ padding: '4px' }}>{formatDate(row.tasktimeemp)}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px' }}>{row.Name}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px' }}>{seconds2hrmin(row.timetocomplete_emp)}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px' }}>{seconds2hrmin(row.actualtimetocomplete_emp)}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px' }}>{row.Activity}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px', textAlign:'left' }}>
                      {row.tasklog.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </TableCell>

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
            count={filteredTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            labelDisplayedRows={({ from, to, count }) =>
              filteredTasks.length !== sortedTaskDetails.length
                ? `Showing ${from} to ${to} of ${count} entries (filtered from ${sortedTaskDetails.length} total entries)`
                : `Showing ${from} to ${to} of ${count} entries`
            }
            style={{ padding: '4px' }}
          />
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TaskInfoDialog;
