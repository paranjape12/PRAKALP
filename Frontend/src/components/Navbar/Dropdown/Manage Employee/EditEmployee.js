import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, InputAdornment, IconButton, } from '@material-ui/core';
import AddEmployee from './AddEmployee';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
const EditEmployee = ({ open, employeeDetails, handleClose }) => {

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const showMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => {
      setMessage('');
      if (setMessage === setSuccessMessage) handleClose();
    }, 1500);
  };

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
    { PageName: 'Employee' },
    { PageName: 'Task' },
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
    if (name === 'loginusinggmail') {
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0
      });
      setShowPasswordFields(!checked);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3001/api/pages')
      .then(response => { })
      .catch(error => { console.error('There was an error fetching the pages!', error); });
  }, []);

  const handleAccessChange = (pageName, accessType) => {
    setFormData(prevState => {
      const newAccess = { ...prevState.access };

      if (!newAccess[pageName]) {
        newAccess[pageName] = {};
      }

      const currentStatus = newAccess[pageName][accessType];

      if (accessType === 'add') {
        if (currentStatus) {
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].add = true;
          newAccess[pageName].edit = true;
          newAccess[pageName].view = true;
        }
      } else if (accessType === 'edit') {
        if (currentStatus) {
          newAccess[pageName].edit = false;
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].edit = true;
          newAccess[pageName].view = true;
        }
      } else if (accessType === 'view') {
        if (currentStatus) {
          newAccess[pageName].view = false;
          newAccess[pageName].edit = false;
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].view = true;
        }
      }

      return {
        ...prevState,
        access: newAccess
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.Password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

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
      })
      .catch(error => {
        console.error('There was an error updating the employee!', error);
      });
  };

  useEffect(() => {
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

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} maxWidth='md'>
      <DialogTitle>Edit Employee
        <Button className='addEmp-btn' style={{ marginLeft: '35rem' }} onClick={() => setOpenDialog(true)} color='primary' variant='contained'>Add Employee</Button>
        <AddEmployee openDialog={openDialog} setOpenDialog={setOpenDialog} pages={pages} />
        <hr style={{ marginTop: "0.3rem", marginBottom: "0" }} />
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className='row'>
          <div className='col-md-6'>
            <FormControl fullWidth required variant="outlined">
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
            <InputLabel
                htmlFor="Empnm"
                className="form-control-label text-dark font-weight-bold"
                style={{ color: "black" }}
              >
                Name
              </InputLabel>
              <TextField
                label="Name"
                placeholder="Enter Name"
                variant="outlined"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                fullWidth
                required
                style={{ marginBottom: "1rem" }}
              />
          {/* Email Field */}
          <InputLabel
                htmlFor="EmpnameEmail"
                className="form-control-label text-dark font-weight-bold"
              >
                Email
              </InputLabel>
              <TextField
                label="Email"
                placeholder="Enter Name eg.abc@protoevc.com"
                variant="outlined"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                fullWidth
                required
                type="email"
                style={{ marginBottom: "1rem" }}
              />
            <div className='row form-group1'>
              <div className='col-md-6'>
                <div className='row'>
                  <div className='col-md-12'>
                  <InputLabel
                        htmlFor="dropRole"
                        className="form-control-label text-dark font-weight-bold"
                      >
                        Role
                      </InputLabel>
                      
                      <FormControl fullWidth required variant="outlined">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={formData.Type}
                          onChange={handleChange}
                          name="Type"
                          label="Role"
                        >
                          <MenuItem value="unset" disabled>
                            Select Role
                          </MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="Team Leader">Team Leader</MenuItem>
                          <MenuItem value="Employee">Employee</MenuItem>
                        </Select>
                      </FormControl>
                  </div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='row'>
                  <div className='col-md-12'>
                  <InputLabel
                        htmlFor="dropLocation"
                        className="form-control-label text-dark font-weight-bold"
                      >
                        Location
                      </InputLabel>
                      <FormControl fullWidth required variant="outlined">
                        <InputLabel>Location</InputLabel>
                        <Select
                          value={formData.Location}
                          onChange={handleChange}
                          name="Location"
                          label="Location"
                        >
                          <MenuItem value="unset" disabled>
                            Select Location
                          </MenuItem>
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
                  control={
                    <Checkbox
                      checked={formData.loginusinggmail}
                      onChange={handleChange}
                      name="loginusinggmail"
                      color="blue"
                    />
                  }
                  label="Use Email For Login"
                ></FormControlLabel>
              </div>
              {showPasswordFields && (
                <>
                  {/* Password Field */}
                  <InputLabel
                    htmlFor="Emppass"
                    className="form-control-label text-dark font-weight-bold"
                  >
                    {" "}
                    Password
                  </InputLabel>
                  <TextField
                    label="Password"
                    placeholder="Enter Password eg.abc@Protovec123"
                    variant="outlined"
                    name="Password" // Corrected from "password"
                    type={showPassword ? "text" : "password"}
                    value={formData.Password}
                    onChange={handleChange}
                    fullWidth
                    required
                    style={{ marginBottom: "1rem" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? (
                              <FontAwesomeIcon icon={faEye} />
                            ) : (
                              <FontAwesomeIcon icon={faEyeSlash} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                 {/* Confirm Password Field */}
                 <InputLabel
                    htmlFor="Emppass"
                    className="form-control-label text-dark font-weight-bold"
                  >
                    Confirm Password
                  </InputLabel>
                  <TextField
                    label="Confirm Password"
                    placeholder="Enter Confirm Password"
                    variant="outlined"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                    type="password"
                    onClick={handleClickShowPassword}
                  >
                    {" "}
                  </TextField>
                </>
              )}
          </div>
          <div className='col-md-6'>
           {/* Nickname Field */}
           <InputLabel
                htmlFor="Empnicnm"
                className="form-control-label text-dark font-weight-bold"
              >
                NickName
              </InputLabel>
              <TextField
                label="Nickname"
                placeholder="Enter Nickname"
                variant="outlined"
                name="Nickname"
                value={formData.Nickname}
                onChange={handleChange}
                fullWidth
                required
                style={{ marginBottom: "1rem" }}
              />
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
                        <Checkbox checked={formData.access[page.PageName]?.add || false} onChange={() => handleAccessChange(page.PageName, 'add')} />
                      </td>
                      <td className="text-center" name='employee'>
                        <Checkbox checked={formData.access[page.PageName]?.edit || false} onChange={() => handleAccessChange(page.PageName, 'edit')} />
                      </td>
                      <td className="text-center" name='task'>
                        <Checkbox checked={formData.access[page.PageName]?.view || false} onChange={() => handleAccessChange(page.PageName, 'view')} />
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
        <Button className='close-btn' onClick={handleClose}  variant='contained'>
          Close
        </Button>
        <Button className='close-btn' onClick={handleDelete} color="danger" variant='contained'>
          Remove
        </Button>
        <Button className='save-btn' onClick={handleSubmit} variant='contained' color='primary'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployee;
