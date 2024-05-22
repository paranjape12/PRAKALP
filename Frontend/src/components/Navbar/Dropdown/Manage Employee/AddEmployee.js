import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@material-ui/core';
import './AddEmployee.css'
import EditEmployee from './EditEmployee';

const AddEmployee = ({ openDialog, setOpenDialog, pages }) => {
  const emailRef = useRef(null);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Type: 'unset',
    Location: 'unset',
    Nickname: '',
    Password: '',
    confirmPassword: '',
    loginusinggmail: 0,
    access: {}
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);

  // const [availabepages, setAvailablePages] = useState([]); //add-emp3

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Check if the "Use Email For Login" checkbox is checked, and hide/show password fields accordingly
    if (name === 'loginusinggmail') {
      setShowPasswordFields(!checked);
    }
  };
  // const handleAccessChange = (pageName, accessType) => {
  //   setFormData(prevState => ({
  //     ...prevState,
  //     access: {
  //       ...prevState.access,
  //       [pageName]: {
  //         ...prevState.access[pageName],
  //         [accessType]: !prevState.access[pageName]?.[accessType]
  //       }
  //     }
  //   }));
  // };

  const handleAccessChange = (pageName, accessValue) => {
    setFormData(prevState => {
      const newAccess = { ...prevState.access };

      if (newAccess[pageName] === accessValue) {
        delete newAccess[pageName];
      } else {
        newAccess[pageName] = accessValue;

        if (accessValue === 3) {
          newAccess[pageName] = 3;
        } else if (accessValue === 2) {
          newAccess[pageName] = newAccess[pageName] === 3 ? 3 : 2;
        } else if (accessValue === 1) {
          newAccess[pageName] = newAccess[pageName] >= 1 ? newAccess[pageName] : 1;
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
    axios.post('http://localhost:3001/api/add-employee', formData)
      .then(response => {
        console.log(response.data);
        // Handle successful form submission
        setOpenDialog(false); // Close the dialog after successful submission
      })
      .catch(error => {
        console.error('There was an error adding the employee!', error);
      });
  };




  // Create a ref for Transition
  const nodeRef = useRef(EditEmployee);

  return (
    <>
      < Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" >
        <DialogTitle>Add New Employee
          <Button className='editEmp-btn' style={{ marginLeft: '35rem' }} onClick={() => setOpenEditDialog(true)}>Edit Employee</Button>
          <EditEmployee openEditDialog={openEditDialog} setOpenEditDialog={setOpenEditDialog} pages={pages} />
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className='row'>
            <div className='col-md-6'>
              {/* Name Field */}
              <label htmlFor="Empnm" className="form-control-label text-dark font-weight-bold">
                Name
              </label>
              <TextField
                label="Name"
                variant="outlined"
                name="name"
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
                name="email"
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
                          name="role"
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
                          name="location"
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
                >
                </FormControlLabel>
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
                NickName
              </label>
              <TextField
                label="Nickname"
                variant="outlined"
                name="nickname"
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
                      <th>No Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages && pages.map(page => (
                      <tr key={page.PageName}>
                        <th className="text-left pagenametable">{page.PageName}</th>
                        <td className="text-center" name='project'>
                          <input type="checkbox" title='Add' onChange={() => handleAccessChange(page.PageName, 3)} checked={formData.access[page.PageName] === 3} />
                        </td>
                        <td className="text-center" name='employee'>
                          <input type="checkbox" title='Edit' onChange={() => handleAccessChange(page.PageName, 2)} checked={formData.access[page.PageName] === 2 || formData.access[page.PageName] === 3} />
                        </td>
                        <td className="text-center" name='task'>
                          <input type="checkbox" title='View' onChange={() => handleAccessChange(page.PageName, 1)} checked={formData.access[page.PageName] >= 1} />
                        </td>
                        <td className="text-center" name='none'>
                          <input type="checkbox" title='None' onChange={() => handleAccessChange(page.PageName, 0)} checked={!formData.access[page.PageName]} />
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
          <Button onClick={() => setOpenDialog(false)} color="danger" variant='contained'>
            Close
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog >
    </>
  );
};

export default AddEmployee;
