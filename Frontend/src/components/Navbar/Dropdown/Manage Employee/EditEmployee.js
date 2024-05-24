import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@material-ui/core';
import AddEmployee from './AddEmployee';

const EditEmployee = ({ openEditDialog, setOpenEditDialog, employeeDetails }) => {

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(true);

  const [formData, setFormData] = useState({
    id: '',
    Name: '',
    Email: '',
    Type: '',
    Location: '',
    Nickname: '',
    Password: '',
    confirmPassword: '',
    loginusinggmail: 0,
    access: {}
  });

  const pages = [
    { PageName: 'Project' },
    { PageName: 'Epmloyee' },
    { PageName: 'Task' },
    // Add more pages as needed
  ];

  useEffect(() => {
    if (employeeDetails) {
      setFormData({
        id: employeeDetails.id || '',
        Name: employeeDetails.Name || '',
        Email: employeeDetails.Email || '',
        Type: employeeDetails.Type || '',
        Location: employeeDetails.Location || '',
        Nickname: employeeDetails.Nickname || '',
        Password: '',
        confirmPassword: '',
        loginusinggmail: employeeDetails.loginusinggmail || false,
        access: employeeDetails.access || {}
      });
      setSelectedEmployee(employeeDetails.Name);
    }
  }, [employeeDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If the checkbox "Use Email For Login" is changed
    if (name === 'loginusinggmail') {
      // If checked, set loginusinggmail to 1, otherwise set it to 0
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0
      });
      // Show/hide password fields based on the checkbox state
      setShowPasswordFields(!checked);
    } else {
      // For other fields, update the form data as usual
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };


  useEffect(() => {
    // Fetch pages
    axios.get('http://localhost:3001/api/pages')
  .then(response => {
    console.log('Pages fetched successfully:', response.data);
  })
  .catch(error => {
    console.error('There was an error fetching the pages!', error);
  });

  }, []);

  const handleAccessChange = (pageName, accessType) => {
    setFormData(prevState => ({
      ...prevState,
      access: {
        ...prevState.access,
        [pageName]: {
          ...prevState.access[pageName],
          [accessType]: !prevState.access[pageName]?.[accessType]
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate password and confirmPassword
    if (formData.Password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Transform access object into pagename and pagevalue arrays
    const pagename = Object.keys(formData.access);
    const pagevalue = pagename.map(page => formData.access[page]);

    const requestData = {
      ...formData,
      pagename,
      pagevalue
    };

    axios.put('http://localhost:3001/api/update-employee', requestData)
      .then(response => {
        console.log(response.data);
        setOpenEditDialog(false);
      })
      .catch(error => {
        console.error('There was an error updating the employee!', error);
      });
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

  const handleDelete = () => {
    axios.delete(`http://localhost:3001/api/delete-employee/${employeeDetails.id}`)
      .then(response => {
        console.log(response.data);
        setOpenEditDialog(false);
        // Fetch the updated list of employees after deletion
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
      })
      .catch(error => {
        console.error('There was an error deleting the employee!', error);
      });
  };

  return (
    <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth='md'>
      <DialogTitle>Edit Employee
        <Button className='addEmp-btn' style={{ marginLeft: '35rem' }} onClick={() => setOpenDialog(true)} color='primary' variant='contained'>Add Employee</Button>
        <AddEmployee openDialog={openDialog} setOpenDialog={setOpenDialog} pages={pages} />
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className='row'>
          <div className='col-md-6'>
            <FormControl fullWidth required variant="outlined" margin="normal">
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
            {/* Name Field */}
            <label htmlFor="Empnm" className="form-control-label text-dark font-weight-bold">
              Name
            </label>
            <TextField
              label="Name"
              variant="outlined"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            {/* Email Field */}
            <label htmlFor="EmpnameEmail" className="form-control-label text-dark font-weight-bold">
              Email
            </label>
            <TextField
              label="Email"
              variant="outlined"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              type="email"
            />
            <div className='row form-group1'>
              {/* Role Field */}
              <div className='col-md-6'>
                <div className='row'>
                  <div className='col-md-12'>
                    <label htmlFor="dropRole" className="form-control-label text-dark font-weight-bold">
                      Role
                    </label>
                    <FormControl fullWidth required variant="outlined" margin="normal">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={formData.Type}
                        onChange={handleChange}
                        name="Type"
                        label="Role"
                      >
                        <MenuItem value="unset" disabled>Select Role</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Team Leader">Team Leader</MenuItem>
                        <MenuItem value="Employee">Employee</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
              {/* Location Field */}
              <div className='col-md-6'>
                <div className='row'>
                  <div className='col-md-12'>
                    <label htmlFor="dropLocation" className="form-control-label text-dark font-weight-bold">
                      Location
                    </label>
                    <FormControl fullWidth required variant="outlined" margin="normal">
                      <InputLabel>Location</InputLabel>
                      <Select
                        value={formData.Location}
                        onChange={handleChange}
                        name="Location"
                        label="Location"
                      >
                        <MenuItem value="unset" disabled>Select Location</MenuItem>
                        <MenuItem value="Mumbai">Mumbai</MenuItem>
                        <MenuItem value="Ratnagiri">Ratnagiri</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-md-12'>
              {/* Use Email For Login Checkbox */}
              <FormControlLabel
                control={<Checkbox checked={formData.loginusinggmail} onChange={handleChange} name="loginusinggmail" />}
                label="Use Email For Login"
              />
            </div>

            {showPasswordFields && (
              <>
                {/* Password Field */}
                <label htmlFor="Emppass" className="form-control-label text-dark font-weight-bold">
                  Password
                </label>
                <TextField
                  label="Password"
                  variant="outlined"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  type="password"
                />
                {/* Confirm Password Field */}
                <label htmlFor="EmpCpass" className="form-control-label text-dark font-weight-bold">
                  Confirm Password
                </label>
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  type="password"
                />
              </>
            )}
          </div>

          <div className='col-md-6'>
            {/* Nickname Field */}
            <label htmlFor="Empnicnm" className="form-control-label text-dark font-weight-bold">
              Nickname
            </label>
            <TextField
              label="Nickname"
              variant="outlined"
              name="Nickname"
              value={formData.Nickname}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            {/* Access To Table */}
            <label htmlFor="text-input1" className="form-control-label text-dark font-weight-bold">Access To</label>
            <div className="table-responsive text-dark">
              <table className="table table-bordered text-dark" id="tableeditsave">
                <thead className="bg-primary text-white">
                  <tr>
                    <th></th>
                    <th>Add</th>
                    <th>Edit</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {pages && pages.map(page => (
                    <tr key={page.PageName}>
                      <th className="text-left pagenametable">{page.PageName}</th>
                      <td className="text-center" name='project'>
                        <input type="checkbox" title='Add' value={0} onChange={() => handleAccessChange(page.PageName, 'add')} checked={formData.access[page.PageName]?.add || false} />
                      </td>
                      <td className="text-center" name='employee'>
                        <input type="checkbox" title='Edit' value={3} onChange={() => handleAccessChange(page.PageName, 'edit')} checked={formData.access[page.PageName]?.edit || false} />
                      </td>
                      <td className="text-center" name='task'>
                        <input type="checkbox" title='View' value={1} onChange={() => handleAccessChange(page.PageName, 'view')} checked={formData.access[page.PageName]?.view || false} />
                      </td>
                      <td className="text-center" name='none' style={{ display: 'none' }}>
                        <input type="checkbox" title='none' value={2} onChange={() => handleAccessChange(page.PageName, 'none')} checked={formData.access[page.PageName]?.none || false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button className='close-btn' onClick={() => setOpenEditDialog(false)} color="danger" variant='contained'>
          Close
        </Button>
        <Button className='btn-remove' onClick={handleDelete} variant='contained'>
          Remove
        </Button>
        <Button className='save-btn' onClick={handleSubmit} variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployee;
