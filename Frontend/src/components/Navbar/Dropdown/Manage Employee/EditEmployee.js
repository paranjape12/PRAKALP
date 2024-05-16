import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you use axios for API requests
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button'; 
import AddEmployee from './AddEmployee';
import './EditEmployee.css';

const EditEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [useEmailForLogin, setUseEmailForLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const handleOpen = () => {
      setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployeeClick = () => {
    // Handle logic for adding employee here
    handleClose(); // Close dialog after adding employee
};

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('API_URL_TO_FETCH_EMPLOYEES');
      if (response.status === 200) {
        setEmployees(response.data);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSaveEmployee = async () => {
    try {
      // Perform validation checks here (e.g., check if passwords match)
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Prepare employee data for submission
      const employeeData = {
        name: empName,
        email: empEmail,
        role,
        location,
        useEmailForLogin,
        password,
      };

      // Make API call to save employee data
      const response = await axios.post('API_URL_TO_SAVE_EMPLOYEE', employeeData);
      if (response.status === 200) {
        // Employee saved successfully, handle any UI changes or notifications
        console.log('Employee saved successfully');
      } else {
        throw new Error('Failed to save employee');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      // Handle error (e.g., display error message to user)
    }
  };

  
    const [pages, setPages] = useState([]);

    // Simulate fetching pages from an API
    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
      try {
          const response = await fetch('/api/pages');
          const contentType = response.headers.get('content-type');
          if (response.ok && contentType && contentType.includes('application/json')) {
              const data = await response.json();
              setPages(data.pages);
          } else {
              console.error('Failed to fetch pages:', response.statusText);
          }
      } catch (error) {
          console.error('Error fetching pages:', error);
      }
  };
  

    const handleCheckboxChange = (pageName, value) => {
        // Handle checkbox change logic here
        console.log(`Checkbox ${pageName} changed to ${value}`);
    };
     
      
  
  return (

    <Dialog open={true} onClose={handleClose} fullWidth>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <DialogTitle>
      <h2>Edit Employee Details</h2>
      </DialogTitle>
      <div>
          <button type='Button' className="button" onClick={() => setShowAddEmployee(true)} >Add New Employee</button>
          {showAddEmployee && <AddEmployee onClose={() => setShowAddEmployee(false)} />}
        </div>
      </div>
      <DialogContent style={{}}>
        <div >
          <div className="modal-body">
            <form className="row">
            <div className="col-md-6">
          <select className="col-md-12 form-select border border-primary rounded">
            <option value="Selectedemp" selected disabled>Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={`edit~${employee.id}`} name={employee.Name}>
                {employee.Name}
              </option>
            ))}
          </select>

          <div className="row form-group">
            <div className="col col-md-6">
              <label htmlFor="Empname" className="form-control-label text-dark font-weight-bold">Name</label>
            </div>
            <div className="col-12 col-md-12">
              <input
                type="text"
                id="Empname"
                name="Empname"
                placeholder="Enter Name"
                className="form-control border-primary"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
              />
              <small className="form-text text-danger" id="Empnamemsgname" style={{ display: 'none' }}></small>
            </div>
          </div>

          <div className="row form-group">
            <div className="col col-md-6">
              <label htmlFor="EmpnameEmail" className="form-control-label text-dark font-weight-bold">Email</label>
            </div>
            <div className="col-12 col-md-12">
              <input
                type="email"
                id="EmpnameEmail"
                name="EmpnameEmail"
                placeholder="Enter Email eg. Abc@Protovec.com"
                className="form-control border-primary"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
              />
              <small className="form-text text-danger" id="EmpnamemsgEmail" style={{ display: 'none' }}></small>
            </div>
          </div>

          <div className="row form-group">
            <div className="col col-md-4">
              <select
                className="col-md-12 form-select border border-primary rounded p-1"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option disabled value="unset">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            <div className="col col-md-4">
              <select
                className="col-md-12 form-select border border-primary rounded p-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option disabled value="unset">Select Location</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Ratnagiri">Ratnagiri</option>
              </select>
            </div>
          </div>

          <div className="form-check col-md-16">
            <input
              className="form-check-input mt-2 emonly"
              type="checkbox"
              checked={useEmailForLogin}
              onChange={(e) => setUseEmailForLogin(e.target.checked)}
            />
            <label className="form-check-label text-dark p-1" htmlFor="emailonly">
              Use Email For Login
            </label>
          </div>

          <div className="form-group passdiv">
            <label htmlFor="Emppass" className="form-control-label text-dark font-weight-bold">Password</label>
            <div className="input-group flex-nowrap">
              <input
                type="password"
                className="form-control border-primary"
                id="Emppass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password eg. Abc@123"
              />
              <div className="input-group-prepend">
                <span className="input-group-text" id="showeye">
                  <i className="fa fa-eye"></i>
                </span>
              </div>
            </div>
            <small className="form-text text-danger" id="Empnamemsgpass" style={{ display: 'none' }}></small>
          </div>

          <div className="form-group passdiv">
            <label htmlFor="EmpCpass" className="form-control-label text-dark font-weight-bold">Confirm Password</label>
            <div className="input-group flex-nowrap">
              <input
                type="password"
                className="form-control border-primary"
                id="EmpCpass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
              />
            </div>
            <small className="form-text text-danger" id="Empnamemsgcpass" style={{ display: 'none' }}></small>
          </div>
        </div>

        {/* Additional Form Fields (e.g., Nickname, Access To table) */}
        {/* Implement other form fields similarly */}
        <div className="col-md-6">
            <div className="row form-group">
                <div className="col col-md-6">
                    <label htmlFor="Nickname" className="form-control-label text-dark font-weight-bold">
                        Nickname
                    </label>
                </div>
                <div className="col-12 col-md-12">
                    <input
                        type="text"
                        id="Nickname"
                        name="text-input"
                        placeholder="Enter Nickname"
                        className="form-control border-primary"
                        title="Name"
                    />
                    <small className="form-text text-danger Empnamemsg" id="EmpnamemsgNickname" style={{ display: 'none' }}></small>
                </div>
            </div>

            <div className="row form-group">
                <div className="col-md-4">
                    <label htmlFor="AccessTo" className="form-control-label text-dark font-weight-bold">
                        Access To
                    </label>
                </div>
                <div className="table-responsive">
            <table className="table table-bordered">
                <thead className="bg-primary text-white">
                    <tr>
                        <th>Page Name</th>
                        <th>Add</th>
                        <th>Edit</th>
                        <th>View</th>
                        <th style={{ display: 'none' }}>No Access</th>
                    </tr>
                </thead>
                <tbody>
                    {pages.map((page, index) => (
                        <tr key={index}>
                            <td className="text-left pagenametable">{page.PageName}</td>
                            <td className="text-center">
                                <input
                                    name={`${page.PageName}-add-${index}`}
                                    className={page.PageName.replace(' ', '')}
                                    type="checkbox"
                                    value="0"
                                    title="add"
                                    onChange={(e) => handleCheckboxChange(page.PageName, e.target.checked)}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    name={`${page.PageName}-edit-${index}`}
                                    className={page.PageName.replace(' ', '')}
                                    type="checkbox"
                                    value="3"
                                    title="edit"
                                    onChange={(e) => handleCheckboxChange(page.PageName, e.target.checked)}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    name={`${page.PageName}-view-${index}`}
                                    className={page.PageName.replace(' ', '')}
                                    type="checkbox"
                                    value="1"
                                    title="view"
                                    onChange={(e) => handleCheckboxChange(page.PageName, e.target.checked)}
                                />
                            </td>
                            <td className="text-center" style={{ display: 'none' }}>
                                <input
                                    name={`${page.PageName}-none-${index}`}
                                    className={page.PageName.replace(' ', '')}
                                    type="checkbox"
                                    value="2"
                                    title="none"
                                    checked
                                    onChange={(e) => handleCheckboxChange(page.PageName, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
</div>
</div>
            </form>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <button type="button" className="btn btn-danger" onClick={handleClose}>
          Close
        </button>
        <button type="button" id="empremove" className="btn btn-danger">
          Remove
        </button>
        <button type="button" className="btn btn-success" onClick={handleSaveEmployee}>
          Save
        </button>
      </DialogActions>
    </Dialog>
   
  );
};

export default EditEmployee;

