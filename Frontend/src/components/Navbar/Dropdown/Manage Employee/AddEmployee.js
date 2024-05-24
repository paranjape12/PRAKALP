import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@material-ui/core';
import './AddEmployee.css'
import EditEmployee from './EditEmployee';

const AddEmployee = ({ openDialog, setOpenDialog }) => {
  const emailRef = useRef(null);
  const [showPasswordFields, setShowPasswordFields] = useState(true);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Type: 'unset',
    Location: 'unset',
    Nickname: '',
    Password: '',
    confirmPassword: '',
    loginusinggmail: 0,
    access: {},
  });

  const pages = [
    { PageName: 'Project' },
    { PageName: 'Epmloyee' },
    { PageName: 'Task' },
    // Add more pages as needed
  ];

  const [openEditDialog, setOpenEditDialog] = useState(false);

  // const [availabepages, setAvailablePages] = useState([]); //add-emp3

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
      const pageAccess = { ...prevState.access };

      if (pageAccess[pageName] === accessValue) {
        delete pageAccess[pageName];
      } else {
        pageAccess[pageName] = accessValue;

        if (accessValue === 3) {
          pageAccess[pageName] = 3;
        } else if (accessValue === 2) {
          pageAccess[pageName] = pageAccess[pageName] === 3 ? 3 : 2;
        } else if (accessValue === 1) {
          pageAccess[pageName] = pageAccess[pageName] >= 1 ? pageAccess[pageName] : 1;
        }
      }

      return {
        ...prevState,
        access: pageAccess
      };
    });
  };

  // Validation function
  const valid = (Name, Email, Password, confirmPassword, Type, Location) => {
    // Check if all fields are filled
    if (!Name || !Email || !Password || !confirmPassword || Type === 'unset' || Location === 'unset') {
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return false;
    }

    // Validate password length
    if (Password.length < 6) {
      return false;
    }

    // Confirm password matches
    if (Password !== confirmPassword) {
      return false;
    }

    // If all conditions pass, return true for valid
    return true;
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   axios.post('http://localhost:3001/api/add-employee', formData)
  //     .then(response => {
  //       console.log(response.data);
  //       // Handle successful form submission
  //       setOpenDialog(false); // Close the dialog after successful submission
  //     })
  //     .catch(error => {
  //       console.error('There was an error adding the employee!', error);
  //     });
  // };


  const handleSubmit = (e) => {
    e.preventDefault();
    const { Name, Email, Password, confirmPassword, Type, Location, Nickname } = formData;
    const selctrole = Type !== 'unset' ? Type : '';
    const selctloc = Location !== 'unset' ? Location : '';
  
    // Extract first name and last name from full name
    const [fname, ...lnameParts] = Name.split(' ');
    const lname = lnameParts.join(' ');
  
    const pagename = [];
    const pagevalue = [];
  
    // Loop through the pages to get their names and values
    pages.forEach(page => {
      pagename.push(page.PageName);
  
      const pageAccess = formData.access[page.PageName];
      if (pageAccess === 3) {
        pagevalue.push(0);
      } else if (pageAccess === 2) {
        pagevalue.push(3);
      } else {
        pagevalue.push(pageAccess);
      }
    });
  
    // Determine if the "Use Email For Login" checkbox is checked
    const loginusinggmail = formData.loginusinggmail ? 1 : 0;
  
    if (valid(Name, Email, Password, confirmPassword, selctrole, selctloc)) {
      axios.post('http://localhost:3001/api/add-employee', {
        Name,
        fname,
        lname,
        Nickname,
        Email,
        Password,
        Type: selctrole,
        Location: selctloc,
        loginusinggmail
      })
        .then(response => {
          if (response.data === 'User exist') {
            // Handle case where employee already exists
            // You can show an error message here
          } else if (response.data === 'Error') {
            // Handle case where there was an error creating the employee
            // You can show an error message here
          } else {
            // Handle successful creation of employee
            // You can show a success message here
            setOpenDialog(false); // Close the dialog after successful submission
            setFormData({
              Name: '',
              Email: '',
              Type: 'unset',
              Location: 'unset',
              Nickname: '',
              Password: '',
              confirmPassword: '',
              loginusinggmail: 0,
              access: {},
            });
          }
        })
        .catch(error => {
          console.error('There was an error adding the employee!', error);
        });
    } else {
      // Handle case where form validation fails
      // You can show an error message here
    }
  };
  



  // Create a ref for Transition
  const nodeRef = useRef(EditEmployee);

  return (
    <>
      < Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" >
        <DialogTitle>Add New Employee
          <Button className='editEmp-btn' style={{ marginLeft: '35rem' }} onClick={() => setOpenEditDialog(true)} color='primary' variant='contained'>Edit Employee</Button>
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
                    name="Password"  // Corrected from "password"
                    value={formData.Password}
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
                      <th>No Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages && pages.map(page => (
                      <tr key={page.PageName}>
                        <th className="text-left pagenametable">{page.PageName}</th>
                        <td className="text-center" name='Project'>
                          <input type="checkbox" title='Add' onChange={() => handleAccessChange(page.PageName, 3)} checked={formData.access[page.PageName] === 3} />
                        </td>
                        <td className="text-center" name='Employee'>
                          <input type="checkbox" title='Edit' onChange={() => handleAccessChange(page.PageName, 2)} checked={formData.access[page.PageName] === 2 || formData.access[page.PageName] === 3} />
                        </td>
                        <td className="text-center" name='Task'>
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
          <Button className='close-btn' onClick={() => setOpenDialog(false)} color="danger" variant='contained'>
            Close
          </Button>
          <Button className='save-btn' onClick={handleSubmit} color="success" variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog >
    </>
  );
};

export default AddEmployee;
