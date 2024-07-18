import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format, subDays } from 'date-fns';

const LogsPopup = ({ open, handleClose, employee , itemsPerPage, totalItems}) => {
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const data = [ /* Your data here */ ];
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const seconds2human = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };


  useEffect(() => {
    // Fetch employees
    axios.post('http://localhost:3001/api/empDropdown', {
      token: localStorage.getItem('token'),
    })
      .then(response => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error('Error: Expected an array but got', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
      });
  }, []);
  // useEffect(() => {
  //   if (employee) {
  //     const fetchEmployeeLogs = async () => {
  //       try {
  //         const response = await axios.post('http://localhost:3001/api/employeeLogs', {
  //           employeeId: employee.id,
  //           fromDate,
  //           toDate,
  //         });
  //         // Handle response data here
  //       } catch (error) {
  //         console.error('Error fetching employee logs:', error);
  //       }
  //     };

  //     fetchEmployeeLogs();
  //   }
  // }, [selectedEmployee, fromDate, toDate]);


  const handlePrevious = () => {
    setCurrentPage(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(Math.min(currentPage + 1, Math.ceil(data.length / ITEMS_PER_PAGE)));
  };

  const currentData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
   
 
    const firstItem = (currentPage - 1) * itemsPerPage + 1;
    const lastItem = Math.min(currentPage * itemsPerPage, totalItems);
  


    
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          padding: 1,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ borderBottom: 0.1, bgcolor: 'background.paper', width: '100%' }}>
          <Box>
            <Typography id="modal-title" variant="h6" component="h1" className="text-primary font-weight-bold">
            {employee && employee.Name}
            </Typography>
            <Typography id="empprojectnamelog" variant="subtitle2" className="text-myback font-weight-bold text-sm m-2" sx={{ fontSize: '13px' }}>
            </Typography>
          </Box>
          <CloseIcon onClick={handleClose} className='close bg-danger text-white pr-1 mr-3' />
        </Box>

        <Box display="flex" alignItems="center" mt={2} sx={{ borderBottom: 0.1, bgcolor: 'background.paper', width: '100%' }}>
          <Typography variant="body2" className="fw-bold" sx={{ pr: 1, mb: 2 }}>
            From<sup className="text-danger">*</sup>
          </Typography>
          <TextField
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputProps={{ inputProps: { max: format(new Date(), 'yyyy-MM-dd') } }}
            size="small"
            sx={{ mr: 2, mb: 2 }}
          />
          <Typography variant="body2" className="fw-bold" sx={{ pr: 1, mb: 2 }}>
            To<sup className="text-danger">*</sup>
          </Typography>
          <TextField
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputProps={{ inputProps: { max: format(new Date(), 'yyyy-MM-dd') } }}
            size="small"
            sx={{ mr: 2, mb: 2 }}
          />
          
        </Box>
        <Box mt={2}>
              <div className="show-entries">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span >Show</span>
              <select >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
            {/* <ul>
              {displayedData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul> */}
          </div>
          </Box>
        <Box mt={2} sx={{ minWidth: 650, bgcolor:'#697689', color:'whitesmoke' }}>
          <TableContainer >
            <Table aria-label="logs table">
              <TableHead>
                <TableRow className="text-center">
                  <TableCell style={{ width: '10%' }}>Date</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Time required (Hr:Min)</TableCell>
                  <TableCell>Time Taken (Hr:Min)</TableCell>
                  <TableCell style={{ width: '20%' }}>Activity</TableCell>
                  <TableCell style={{ width: '20%' }}>Logs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="Emplogbody">
              {logs.map((log, index) => {
          const timeRequired = seconds2human(parseInt(log.timeRequired));
          const timeTaken = log.timeTaken ? seconds2human(parseInt(log.timeTaken)) : '-';
          return (
            <tr key={index} className="text-center">
              <td>{new Date(log.date).toISOString().split('T')[0]}</td>
              <td className="text-left">{log.projectName}</td>
              <td className="text-left">{log.taskName}</td>
              <td>{timeRequired}</td>
              <td>{timeTaken}</td>
              <td>{log.activity}</td>
              <td className="text-left">{log.logs}</td>
            </tr>
          );
        })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
           <Box>   
        <div>
          
      {/* Your search bar component here */}
      <ul>
        {currentData.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

     
          <DialogActions>
          <span>
            Showing {firstItem} to {lastItem} of {totalItems} entries
          </span>
       <button onClick={handlePrevious} disabled={currentPage === 1}>
        Previous
      </button>
      <button onClick={handleNext} disabled={currentPage === Math.ceil(data.length / ITEMS_PER_PAGE)}>
        Next
      </button>
      </DialogActions>
    </div>
    </Box>
      </Box>
    </Modal>
  );
};

export default LogsPopup;
