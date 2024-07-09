import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format, subDays } from 'date-fns';
import axios from 'axios';



const LogsPopup = ({ open, handleClose }) => {
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
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
  
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box
       sx={{
        position: 'absolute',
        top: '14%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        padding: 1,
      }}
       
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ borderBottom: 0.1, bgcolor: 'background.paper', width: '100%' }} >
          <Box>
            <Typography id="modal-title" variant="h6" component="h1" className="text-primary font-weight-bold">
              <div id="selempdrop" label="Select Employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                {employees.map((employee) => (

                  <span  value={employee.Name}>
                    {employee.Name}
                  </span>
                ))}
              </div>
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

        <Box mt={2} sx={{ minWidth: 650, bgcolor:'#697689',color:'whitesmoke' }}>
          <TableContainer >
            <Table   aria-label="logs table">
              <TableHead >
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
                {/* Add rows here dynamically */}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Modal>
  );
};

export default LogsPopup;