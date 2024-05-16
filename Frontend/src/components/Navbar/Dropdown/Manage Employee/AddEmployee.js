import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import './AddEmployee.css';
import EditEmployee from './EditEmployee';

// function AddEmployee() {
//   const [open, setOpen] = useState(false);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };


function AddEmployee({ onClose }) {
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [open, setOpen] = useState(true); // Open the dialog by default

  const handleClose = () => {
    setOpen(false);
    onClose(); // Call the onClose function passed from the parent
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Submit the data to your backend here
  };

  const [checkboxes, setCheckboxes] = useState({
    Project: { add: false, edit: false, view: false },
    Employee: { add: false, edit: false, view: false },
    Task: { add: false, edit: false, view: false }
  });

  const handleCheckboxChange = (category, action) => {
    const updatedCheckboxes = { ...checkboxes };

    // Update the state of the checkboxes based on the action
    if (action === 'add') {
      updatedCheckboxes[category].add = !updatedCheckboxes[category].add;
      if (updatedCheckboxes[category].add) {
        updatedCheckboxes[category].edit = true;
        updatedCheckboxes[category].view = true;
      } else {
        updatedCheckboxes[category].edit = false;
        updatedCheckboxes[category].view = false;
      }
    } else if (action === 'edit') {
      updatedCheckboxes[category].edit = !updatedCheckboxes[category].edit;
      if (updatedCheckboxes[category].edit && !updatedCheckboxes[category].add) {
        updatedCheckboxes[category].add = true;
        updatedCheckboxes[category].view = true;
      } else if (!updatedCheckboxes[category].edit && updatedCheckboxes[category].add) {
        updatedCheckboxes[category].view = false;
      }
    } else if (action === 'view') {
      updatedCheckboxes[category].view = !updatedCheckboxes[category].view;
      if (!updatedCheckboxes[category].view && updatedCheckboxes[category].add) {
        updatedCheckboxes[category].edit = false;
      }
    }

    setCheckboxes(updatedCheckboxes);
  };



  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle>Add New Employee</DialogTitle>
          <div>
            <Button style={{ marginRight: '10px' }} variant="contained" color="primary" onClick={() => setShowEditEmployee(true)}>Edit Employee Details</Button>
            {showEditEmployee && <EditEmployee onClose={() => setShowEditEmployee(false)} />}
          </div>
        </div>

        {/* <DialogTitle>Add New Employee</DialogTitle> */}
        <DialogContent>
          <form className="row">
            {/* Left column */}
            <div className="col-md-6">
              {/* Name */}
              <div className="row form-group1 ndiv">
                <div className="col col-md-6">
                  <label htmlFor="Empnm" className="form-control-label text-dark font-weight-bold">
                    Name
                  </label>
                </div>
                <div className="col-12 col-md-12">
                  <TextField
                    id="Empnm"
                    label="Name"
                    variant="outlined"
                    fullWidth
                    placeholder="Enter Name"
                    // type="password"
                    multiline
                    maxRows={1}
                    className="custom-text-field" // Apply the custom style
                  // Add necessary event handlers and state
                  />
                  {/* Error message */}
                  <small className="form-text text-danger Empnamemsgnm" id="Empnamemsgnm" style={{ display: 'none' }}></small>
                </div>
              </div>
              {/* Email */}
              <div className="row form-group1">
                <div className="col col-md-6">
                  <label htmlFor="EmpnameEmail" className="form-control-label text-dark font-weight-bold">
                    Email
                  </label>
                </div>
                <div className="col-12 col-md-12">
                  <TextField
                    id="EmpnameEmail"

                    variant="outlined"
                    fullWidth
                    placeholder="Enter Email eg. Abc@Protovec.com"
                    type="email"
                    className="custom-text-field" // Apply the custom style
                  // Add necessary event handlers and state
                  />
                  {/* Error message */}
                  <small className="form-text text-danger Empnamemsg" id="EmpnamemsgEmail" style={{ display: 'none' }}>
                  </small>
                </div>
              </div>
              <div className="row form-group1">
                {/* Role */}
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-12">
                      <label htmlFor="dropRole" className="form-control-label text-dark font-weight-bold">
                        Role
                      </label>
                    </div>
                    <div className="col-md-12">
                      <select className="form-select border border-primary rounded p-1" aria-label="Default select example" id="dropRole">
                        <option value="unset" disabled>Select Role</option>
                        <option value="Admin">Admin</option>
                        <option value="Team Leader">Team Leader</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-12">
                      <label htmlFor="dropLocation" className="form-control-label text-dark font-weight-bold">
                        Location
                      </label>
                    </div>
                    <div className="col-md-12">
                      <select className="form-select border border-primary rounded p-1" aria-label="Default select example" id="dropLocation">
                        <option value="unset" disabled>Select Location</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Ratnagiri">Ratnagiri</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Use Email for Login */}
              <div className="form-check col-md-12">
                <input className="form-check-input mt-2 emonly" type="checkbox" value="" id="emailonly" />
                <label className="form-check-label text-dark p-1" htmlFor="emailonly">
                  Use Email For Login
                </label>
              </div>
              {/* Password */}
              <div className="row form-group1 passdiv">
                <div className="col col-md-6">
                  <label htmlFor="Emppass" className="form-control-label text-dark font-weight-bold">
                    Password
                  </label>
                </div>
                <div className="col-12 col-md-12">
                  <TextField
                    id="Emppass"
                    label="Password"
                    variant="outlined"
                    fullWidth
                    placeholder="Enter Password eg. Abc@123"
                    type="password"
                    className="custom-text-field" // Apply the custom style
                  // Add necessary event handlers and state
                  />
                  {/* Error message */}
                  <small className="form-text text-danger Empnamemsgpass" id="Empnamemsgpass" style={{ display: 'none' }}></small>
                </div>
              </div>
              {/* Confirm Password */}
              <div className="row form-group1 passdiv">
                <div className="col col-md-6">
                  <label htmlFor="EmpCpass" className="form-control-label text-dark font-weight-bold">
                    Confirm Password
                  </label>
                </div>
                <div className="col-12 col-md-12">
                  <TextField
                    id="EmpCpass"
                    label="Confirm Password"
                    variant="outlined"
                    fullWidth
                    placeholder="Enter Password"
                    type="password"
                    className="custom-text-field" // Apply the custom style
                  // Add necessary event handlers and state
                  />
                  {/* Error message */}
                  <small className="form-text text-danger Empnamemsg" id="Empnamemsgcpass" style={{ display: 'none' }}></small>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="col-md-6">

              {/* Name */}
              <div className="row form-group1 ndiv">
                <div className="col col-md-6">
                  <label htmlFor="Empnicnm" className="form-control-label text-dark font-weight-bold">
                    NickName
                  </label>
                </div>
                <div className="col-12 col-md-12">
                  <TextField
                    id="Empnicnm"
                    label="Nickname"
                    variant="outlined"
                    fullWidth
                    placeholder="Enter Nickname"
                    // type="password"
                    multiline
                    maxRows={1}
                    className="custom-text-field" // Apply the custom style
                  // Add necessary event handlers and state
                  />
                  {/* Error message */}
                  <small className="form-text text-danger Empnamemsgpnicnm" id="Empnamemsgnicnm" style={{ display: 'none' }}></small>
                </div>
              </div>
              {/* Access To table */}
              <div className="row form-group1">
                <div className="col-md-12">
                  <label htmlFor="text-input1" className="form-control-label text-dark font-weight-bold">Access To</label>
                  <div className="table-responsive text-dark">
                    <table className="table table-bordered text-dark" id="tableeditsave">
                      <thead className="bg-primary text-white">
                        <tr>
                          <th></th>
                          <th>Add</th>
                          <th>Edit</th>
                          <th>View</th>
                          <th style={{ display: 'none' }}>No Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th className="text-left pagenametable" id="Project">Project</th>
                          <td className="text-center">
                            <input
                              name="Project"
                              className="Project"
                              type="checkbox"
                              checked={checkboxes.Project.add}
                              onChange={() => handleCheckboxChange('Project', 'add')}
                              title="add"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              name="Project"
                              className="Project"
                              type="checkbox"
                              checked={checkboxes.Project.edit}
                              onChange={() => handleCheckboxChange('Project', 'edit')}
                              title="edit"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              name="Project"
                              className="Project"
                              type="checkbox"
                              checked={checkboxes.Project.view}
                              onChange={() => handleCheckboxChange('Project', 'view')}
                              title="view"
                            />
                          </td>
                          <td className="text-center" style={{ display: 'none' }}>
                            <input name="Project" className="Project" type="checkbox" value="2" title="none" checked="" />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left pagenametable" id="Employee">Employee</th>
                          <td className="text-center">
                            <input
                              name="Employee"
                              className="Employee"
                              type="checkbox"
                              checked={checkboxes.Employee.add}
                              onChange={() => handleCheckboxChange('Employee', 'add')}
                              title="add"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              name="Employee"
                              className="Employee"
                              type="checkbox"
                              checked={checkboxes.Employee.edit}
                              onChange={() => handleCheckboxChange('Employee', 'edit')}
                              title="edit"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              name="Employee"
                              className="Employee"
                              type="checkbox"
                              checked={checkboxes.Employee.view}
                              onChange={() => handleCheckboxChange('Employee', 'view')}
                              title="view"
                            />
                          </td>
                          <td className="text-center" style={{ display: 'none' }}>
                            <input name="Employee" className="Employee" type="checkbox" value="2" title="none" checked="" />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left pagenametable" id="Task">Task</th>
                          <td className="text-center">
                            <input
                              name="Task"
                              className="Task"
                              type="checkbox"
                              checked={checkboxes.Task.add}
                              onChange={() => handleCheckboxChange('Task', 'add')}
                              title="add"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              name="Task"
                              className="Task"
                              type="checkbox"
                              checked={checkboxes.Task.edit}
                              onChange={() => handleCheckboxChange('Task', 'edit')}
                              title="edit"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              name="Task"
                              className="Task"
                              type="checkbox"
                              checked={checkboxes.Task.view}
                              onChange={() => handleCheckboxChange('Task', 'view')}
                              title="view"
                            />
                          </td>
                          <td className="text-center" style={{ display: 'none' }}>
                            <input name="Task" className="Task" type="checkbox" value="2" title="none" checked="" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <div>
            <Button onClick={handleClose} color="error" variant="contained" style={{ marginRight: '10px' }}>
              Close
            </Button>
            <Button onClick={handleClose} color="success" variant="contained">
              Save
            </Button>
          </div>

        </DialogActions>
      </Dialog>
    </React.Fragment>

  );
}

export default AddEmployee;